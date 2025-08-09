import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, AuthenticatedRequest, AuthService } from '../services/auth.js';
import { StorageService } from '../services/storage.js';
import { SimpleQueueService } from '../services/simple-queue.js';
import { db } from '../db/index.js';
import { videoUploads, auditLogs } from '../../shared/skify-schema.js';
import { eq } from 'drizzle-orm';

const router = Router();
const storageService = new StorageService();
const queueService = new SimpleQueueService();

// Generate signed upload URL
router.post('/sign', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    // Validate request
    const { filename, contentType, size } = z.object({
      filename: z.string().min(1).max(255),
      contentType: z.string().regex(/^video\/|^image\//),
      size: z.number().positive().max(500 * 1024 * 1024) // 500MB limit
    }).parse(req.body);

    // Check upload quota
    const canUpload = await AuthService.incrementUploadUsage(req.userId!);
    if (!canUpload) {
      return res.status(402).json({
        success: false,
        error: 'Upload limit exceeded',
        upgradeRequired: true
      });
    }

    // Generate signed URL
    const uploadData = await storageService.generateUploadUrl(
      filename,
      contentType,
      req.userId!
    );

    // Create video upload record
    const [videoUpload] = await db.insert(videoUploads).values({
      userId: req.userId!,
      filename,
      s3Key: uploadData.s3Key,
      s3Url: storageService.getPublicUrl(uploadData.s3Key),
      size,
      mimeType: contentType,
      status: 'uploading'
    }).returning();

    // Log upload initiation
    await db.insert(auditLogs).values({
      userId: req.userId!,
      action: 'upload_initiated',
      resource: 'video',
      resourceId: videoUpload.id,
      details: { filename, size, contentType },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: {
        uploadId: videoUpload.id,
        signedUrl: uploadData.signedUrl,
        expiresAt: uploadData.expiresAt
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Complete upload and trigger analysis
router.post('/complete', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { uploadId } = z.object({
      uploadId: z.string().uuid()
    }).parse(req.body);

    // Get upload record
    const [upload] = await db.select()
      .from(videoUploads)
      .where(eq(videoUploads.id, uploadId))
      .limit(1);

    if (!upload || upload.userId !== req.userId) {
      return res.status(404).json({
        success: false,
        error: 'Upload not found'
      });
    }

    if (upload.status !== 'uploading') {
      return res.status(400).json({
        success: false,
        error: 'Upload already processed'
      });
    }

    // Update upload status
    await db.update(videoUploads)
      .set({
        status: 'uploaded',
        updatedAt: new Date()
      })
      .where(eq(videoUploads.id, uploadId));

    // Queue analysis job
    const jobId = await queueService.queueAnalysis(
      upload.id,
      upload.s3Url,
      req.userId!
    );

    // Update to analyzing status
    await db.update(videoUploads)
      .set({
        status: 'analyzing',
        updatedAt: new Date()
      })
      .where(eq(videoUploads.id, uploadId));

    // Log completion
    await db.insert(auditLogs).values({
      userId: req.userId!,
      action: 'upload_completed',
      resource: 'video',
      resourceId: uploadId,
      details: { jobId, filename: upload.filename },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: {
        uploadId,
        status: 'analyzing',
        jobId
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get upload status
router.get('/:uploadId/status', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { uploadId } = req.params;

    const [upload] = await db.select()
      .from(videoUploads)
      .where(eq(videoUploads.id, uploadId))
      .limit(1);

    if (!upload || upload.userId !== req.userId) {
      return res.status(404).json({
        success: false,
        error: 'Upload not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: upload.id,
        filename: upload.filename,
        status: upload.status,
        createdAt: upload.createdAt,
        analysisResult: upload.analysisResult
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user's uploads
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const offset = (page - 1) * limit;

    const uploads = await db.select({
      id: videoUploads.id,
      filename: videoUploads.filename,
      status: videoUploads.status,
      duration: videoUploads.duration,
      createdAt: videoUploads.createdAt
    })
    .from(videoUploads)
    .where(eq(videoUploads.userId, req.userId!))
    .orderBy(videoUploads.createdAt)
    .limit(limit)
    .offset(offset);

    res.json({
      success: true,
      data: {
        uploads,
        pagination: {
          page,
          limit,
          total: uploads.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete upload
router.delete('/:uploadId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { uploadId } = req.params;

    const [upload] = await db.select()
      .from(videoUploads)
      .where(eq(videoUploads.id, uploadId))
      .limit(1);

    if (!upload || upload.userId !== req.userId) {
      return res.status(404).json({
        success: false,
        error: 'Upload not found'
      });
    }

    // Delete from S3
    try {
      await storageService.deleteFile(upload.s3Key);
    } catch (error) {
      console.warn('Failed to delete file from S3:', error);
    }

    // Delete from database
    await db.delete(videoUploads).where(eq(videoUploads.id, uploadId));

    // Log deletion
    await db.insert(auditLogs).values({
      userId: req.userId!,
      action: 'upload_deleted',
      resource: 'video',
      resourceId: uploadId,
      details: { filename: upload.filename },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Upload deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;