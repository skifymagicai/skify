import { Router } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../services/auth.js';
import { QueueService } from '../services/queue.js';
import { db } from '../db/index.js';
import { renderJobs } from '../../shared/skify-schema.js';
import { eq, and } from 'drizzle-orm';

const router = Router();
const queueService = new QueueService();

// Get job status
router.get('/:jobId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { jobId } = req.params;

    // Get render job from database
    const [renderJob] = await db.select()
      .from(renderJobs)
      .where(and(
        eq(renderJobs.id, jobId),
        eq(renderJobs.userId, req.userId!)
      ))
      .limit(1);

    if (!renderJob) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Calculate estimated time remaining
    let estimatedTimeRemaining: number | undefined;
    if (renderJob.status === 'processing' && renderJob.startedAt) {
      const elapsedSeconds = Math.floor((Date.now() - renderJob.startedAt.getTime()) / 1000);
      const progressRate = renderJob.progress / elapsedSeconds;
      const remainingProgress = 100 - renderJob.progress;
      estimatedTimeRemaining = remainingProgress / progressRate;
    }

    res.json({
      success: true,
      data: {
        id: renderJob.id,
        status: renderJob.status,
        progress: renderJob.progress,
        resultUrl: renderJob.resultUrl,
        errorMessage: renderJob.errorMessage,
        estimatedTimeRemaining,
        createdAt: renderJob.createdAt,
        startedAt: renderJob.startedAt,
        completedAt: renderJob.completedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user's jobs
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const offset = (page - 1) * limit;

    const jobs = await db.select({
      id: renderJobs.id,
      templateId: renderJobs.templateId,
      status: renderJobs.status,
      progress: renderJobs.progress,
      resultUrl: renderJobs.resultUrl,
      renderSettings: renderJobs.renderSettings,
      createdAt: renderJobs.createdAt,
      startedAt: renderJobs.startedAt,
      completedAt: renderJobs.completedAt
    })
    .from(renderJobs)
    .where(eq(renderJobs.userId, req.userId!))
    .orderBy(renderJobs.createdAt)
    .limit(limit)
    .offset(offset);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page,
          limit,
          total: jobs.length
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

// Cancel job (if not completed)
router.delete('/:jobId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { jobId } = req.params;

    const [renderJob] = await db.select()
      .from(renderJobs)
      .where(and(
        eq(renderJobs.id, jobId),
        eq(renderJobs.userId, req.userId!)
      ))
      .limit(1);

    if (!renderJob) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    if (['completed', 'failed'].includes(renderJob.status)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel completed job'
      });
    }

    // Update job status to cancelled
    await db.update(renderJobs)
      .set({
        status: 'failed',
        errorMessage: 'Cancelled by user',
        completedAt: new Date()
      })
      .where(eq(renderJobs.id, jobId));

    res.json({
      success: true,
      message: 'Job cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;