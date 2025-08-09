import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, AuthenticatedRequest, optionalAuth } from '../services/auth.js';
import { QueueService } from '../services/queue.js';
import { db } from '../db/index.js';
import { 
  templates, 
  renderJobs, 
  templateLikes, 
  videoUploads, 
  styleAnalyses,
  auditLogs 
} from '../../shared/skify-schema.js';
import { eq, desc, and, sql } from 'drizzle-orm';

const router = Router();
const queueService = new QueueService();

// Get public templates
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 12, 50);
    const offset = (page - 1) * limit;

    const templatesQuery = await db.select({
      id: templates.id,
      name: templates.name,
      description: templates.description,
      thumbnailUrl: templates.thumbnailUrl,
      tags: templates.tags,
      likes: templates.likes,
      uses: templates.uses,
      createdAt: templates.createdAt,
      // Check if user liked this template
      isLiked: req.userId ? sql<boolean>`EXISTS(
        SELECT 1 FROM ${templateLikes} 
        WHERE ${templateLikes.userId} = ${req.userId} 
        AND ${templateLikes.templateId} = ${templates.id}
      )` : sql<boolean>`false`
    })
    .from(templates)
    .where(eq(templates.isPublic, true))
    .orderBy(desc(templates.likes), desc(templates.createdAt))
    .limit(limit)
    .offset(offset);

    res.json({
      success: true,
      data: {
        templates: templatesQuery,
        pagination: {
          page,
          limit,
          total: templatesQuery.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user's templates
router.get('/my', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userTemplates = await db.select({
      id: templates.id,
      name: templates.name,
      description: templates.description,
      thumbnailUrl: templates.thumbnailUrl,
      tags: templates.tags,
      likes: templates.likes,
      uses: templates.uses,
      isPublic: templates.isPublic,
      createdAt: templates.createdAt
    })
    .from(templates)
    .where(eq(templates.userId, req.userId!))
    .orderBy(desc(templates.createdAt));

    res.json({
      success: true,
      data: { templates: userTemplates }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get template details
router.get('/:templateId', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { templateId } = req.params;

    const [template] = await db.select({
      id: templates.id,
      name: templates.name,
      description: templates.description,
      thumbnailUrl: templates.thumbnailUrl,
      tags: templates.tags,
      likes: templates.likes,
      uses: templates.uses,
      isPublic: templates.isPublic,
      version: templates.version,
      createdAt: templates.createdAt,
      // Include style analysis data
      styleAnalysis: {
        timing: styleAnalyses.timing,
        visual: styleAnalyses.visual,
        audio: styleAnalyses.audio,
        text: styleAnalyses.text,
        confidence: styleAnalyses.confidence
      }
    })
    .from(templates)
    .innerJoin(styleAnalyses, eq(templates.styleAnalysisId, styleAnalyses.id))
    .where(eq(templates.id, templateId))
    .limit(1);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    // Check if template is public or owned by user
    if (!template.isPublic && (!req.userId || template.userId !== req.userId)) {
      return res.status(403).json({
        success: false,
        error: 'Template access denied'
      });
    }

    // Check if user liked this template
    let isLiked = false;
    if (req.userId) {
      const [like] = await db.select()
        .from(templateLikes)
        .where(and(
          eq(templateLikes.userId, req.userId),
          eq(templateLikes.templateId, templateId)
        ))
        .limit(1);
      isLiked = !!like;
    }

    res.json({
      success: true,
      data: {
        ...template,
        isLiked
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create template from video
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { videoId, name, description, tags, isPublic } = z.object({
      videoId: z.string().uuid(),
      name: z.string().min(1).max(200),
      description: z.string().optional(),
      tags: z.array(z.string()).default([]),
      isPublic: z.boolean().default(false)
    }).parse(req.body);

    // Get video upload
    const [video] = await db.select()
      .from(videoUploads)
      .where(eq(videoUploads.id, videoId))
      .limit(1);

    if (!video || video.userId !== req.userId) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    if (video.status !== 'analyzed' || !video.analysisResult) {
      return res.status(400).json({
        success: false,
        error: 'Video analysis not completed'
      });
    }

    // Create style analysis record
    const analysisData = video.analysisResult as any;
    const [styleAnalysis] = await db.insert(styleAnalyses).values({
      videoId: video.id,
      timing: analysisData.timing,
      visual: analysisData.visual,
      audio: analysisData.audio,
      text: analysisData.text,
      confidence: analysisData.confidence || 0.85
    }).returning();

    // Create template
    const [template] = await db.insert(templates).values({
      userId: req.userId!,
      name,
      description,
      sourceVideoId: videoId,
      styleAnalysisId: styleAnalysis.id,
      tags,
      isPublic,
      thumbnailUrl: video.s3Url // Use video as thumbnail for now
    }).returning();

    // Log template creation
    await db.insert(auditLogs).values({
      userId: req.userId!,
      action: 'template_created',
      resource: 'template',
      resourceId: template.id,
      details: { name, isPublic, tags },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      data: { template }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Apply template to user media
router.post('/:templateId/apply', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { templateId } = req.params;
    const { sourceMediaIds, renderSettings } = z.object({
      sourceMediaIds: z.array(z.string().uuid()).min(1),
      renderSettings: z.object({
        resolution: z.enum(['720p', '1080p', '4K']).default('1080p'),
        quality: z.enum(['draft', 'standard', 'high', 'ultra']).default('standard'),
        watermark: z.boolean().default(true),
        format: z.enum(['mp4', 'mov']).default('mp4'),
        applyLayers: z.object({
          timing: z.boolean().default(true),
          visual: z.boolean().default(true),
          audio: z.boolean().default(true),
          text: z.boolean().default(true),
          background: z.boolean().default(false)
        }).default({})
      })
    }).parse(req.body);

    // Get template
    const [template] = await db.select()
      .from(templates)
      .where(eq(templates.id, templateId))
      .limit(1);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    // Check access
    if (!template.isPublic && template.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Template access denied'
      });
    }

    // Validate source media belongs to user
    const sourceMedia = await db.select()
      .from(videoUploads)
      .where(and(
        eq(videoUploads.userId, req.userId!),
        sql`${videoUploads.id} = ANY(${sourceMediaIds})`
      ));

    if (sourceMedia.length !== sourceMediaIds.length) {
      return res.status(400).json({
        success: false,
        error: 'Some source media not found or access denied'
      });
    }

    // Create render job
    const [renderJob] = await db.insert(renderJobs).values({
      userId: req.userId!,
      templateId,
      sourceMediaIds,
      renderSettings: renderSettings as any,
      status: 'queued',
      priority: renderSettings.resolution === '4K' ? 3 : 5
    }).returning();

    // Queue render job
    const queueJobId = await queueService.queueRender(
      renderJob.id,
      templateId,
      sourceMediaIds,
      renderSettings
    );

    // Update template usage
    await db.update(templates)
      .set({ uses: sql`${templates.uses} + 1` })
      .where(eq(templates.id, templateId));

    // Log template usage
    await db.insert(auditLogs).values({
      userId: req.userId!,
      action: 'template_applied',
      resource: 'template',
      resourceId: templateId,
      details: { 
        renderJobId: renderJob.id, 
        sourceMediaCount: sourceMediaIds.length,
        renderSettings 
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      data: {
        renderJobId: renderJob.id,
        queueJobId,
        status: 'queued',
        estimatedDuration: 120 // 2 minutes estimate
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Like/unlike template
router.post('/:templateId/like', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { templateId } = req.params;

    // Check if already liked
    const [existingLike] = await db.select()
      .from(templateLikes)
      .where(and(
        eq(templateLikes.userId, req.userId!),
        eq(templateLikes.templateId, templateId)
      ))
      .limit(1);

    if (existingLike) {
      // Unlike
      await db.delete(templateLikes)
        .where(eq(templateLikes.id, existingLike.id));

      // Decrement likes
      await db.update(templates)
        .set({ likes: sql`${templates.likes} - 1` })
        .where(eq(templates.id, templateId));

      res.json({
        success: true,
        data: { liked: false }
      });
    } else {
      // Like
      await db.insert(templateLikes).values({
        userId: req.userId!,
        templateId
      });

      // Increment likes
      await db.update(templates)
        .set({ likes: sql`${templates.likes} + 1` })
        .where(eq(templates.id, templateId));

      res.json({
        success: true,
        data: { liked: true }
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete template
router.delete('/:templateId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { templateId } = req.params;

    const [template] = await db.select()
      .from(templates)
      .where(eq(templates.id, templateId))
      .limit(1);

    if (!template || template.userId !== req.userId) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    // Delete template
    await db.delete(templates).where(eq(templates.id, templateId));

    // Log deletion
    await db.insert(auditLogs).values({
      userId: req.userId!,
      action: 'template_deleted',
      resource: 'template',
      resourceId: templateId,
      details: { name: template.name },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;