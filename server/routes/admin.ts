import { Router } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../services/auth.js';
import { db } from '../db/index.js';
import { 
  auditLogs, 
  moderationItems, 
  users, 
  videoUploads,
  templates,
  renderJobs 
} from '../../shared/skify-schema.js';
import { desc, eq } from 'drizzle-orm';

const router = Router();

// Admin middleware (in production, check user role)
const requireAdmin = async (req: AuthenticatedRequest, res: any, next: any) => {
  // For demo purposes, allow any authenticated user
  // In production, check if user has admin role
  if (!req.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Get moderation queue
router.get('/moderation', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;

    const moderationQueue = await db.select({
      id: moderationItems.id,
      userId: moderationItems.userId,
      resourceType: moderationItems.resourceType,
      resourceId: moderationItems.resourceId,
      status: moderationItems.status,
      reason: moderationItems.reason,
      createdAt: moderationItems.createdAt,
      // Get user info
      userName: users.username,
      userEmail: users.email
    })
    .from(moderationItems)
    .leftJoin(users, eq(moderationItems.userId, users.id))
    .orderBy(desc(moderationItems.createdAt))
    .limit(limit)
    .offset(offset);

    res.json({
      success: true,
      data: {
        items: moderationQueue,
        pagination: {
          page,
          limit,
          total: moderationQueue.length
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

// Get audit logs
router.get('/audit', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);
    const offset = (page - 1) * limit;

    const logs = await db.select({
      id: auditLogs.id,
      userId: auditLogs.userId,
      action: auditLogs.action,
      resource: auditLogs.resource,
      resourceId: auditLogs.resourceId,
      details: auditLogs.details,
      ipAddress: auditLogs.ipAddress,
      userAgent: auditLogs.userAgent,
      timestamp: auditLogs.timestamp,
      // Get user info
      userName: users.username,
      userEmail: users.email
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .orderBy(desc(auditLogs.timestamp))
    .limit(limit)
    .offset(offset);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total: logs.length
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

// Get platform statistics
router.get('/stats', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    // Get basic counts
    const [userCount] = await db.select({ count: users.id }).from(users);
    const [videoCount] = await db.select({ count: videoUploads.id }).from(videoUploads);
    const [templateCount] = await db.select({ count: templates.id }).from(templates);
    const [jobCount] = await db.select({ count: renderJobs.id }).from(renderJobs);

    // Get tier distribution
    const tierStats = await db
      .select({
        tier: users.tier,
        count: users.id
      })
      .from(users)
      .groupBy(users.tier);

    // Get recent activity (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentActivity = await db.select({ count: auditLogs.id })
      .from(auditLogs)
      .where(sql`${auditLogs.timestamp} > ${yesterday}`);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers: userCount?.count || 0,
          totalVideos: videoCount?.count || 0,
          totalTemplates: templateCount?.count || 0,
          totalJobs: jobCount?.count || 0
        },
        userTiers: tierStats.reduce((acc, { tier, count }) => {
          acc[tier] = count;
          return acc;
        }, {} as Record<string, number>),
        recentActivity: recentActivity[0]?.count || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Moderate content (approve/reject)
router.post('/moderation/:itemId', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { itemId } = req.params;
    const { action, reason } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action'
      });
    }

    await db.update(moderationItems)
      .set({
        status: action === 'approve' ? 'approved' : 'rejected',
        reason,
        reviewedBy: req.userId!,
        reviewedAt: new Date()
      })
      .where(eq(moderationItems.id, itemId));

    // Log moderation action
    await db.insert(auditLogs).values({
      userId: req.userId!,
      action: 'content_moderated',
      resource: 'moderation_item',
      resourceId: itemId,
      details: { action, reason },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: `Content ${action}ed successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;