import { Router } from 'express';
import { z } from 'zod';
import { AuthService, authenticateToken, AuthenticatedRequest } from '../services/auth.js';
import { insertUserSchema } from '../../shared/skify-schema.js';
import { db } from '../db/index.js';
import { auditLogs } from '../../shared/skify-schema.js';

const router = Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const userData = insertUserSchema.parse(req.body);
    
    const user = await AuthService.createUser(userData);
    const token = AuthService.generateToken(user.id);

    // Log registration
    await db.insert(auditLogs).values({
      userId: user.id,
      action: 'user_register',
      resource: 'user',
      resourceId: user.id,
      details: { email: user.email, tier: user.tier },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      data: {
        user,
        token,
        expiresIn: '7d'
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = z.object({
      email: z.string().email(),
      password: z.string()
    }).parse(req.body);

    const user = await AuthService.authenticateUser(email, password);
    const token = AuthService.generateToken(user.id);

    // Log login
    await db.insert(auditLogs).values({
      userId: user.id,
      action: 'user_login',
      resource: 'user',
      resourceId: user.id,
      details: { email: user.email },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: {
        user,
        token,
        expiresIn: '7d'
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await AuthService.getUserById(req.userId!);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Check upload quota
router.get('/quota', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await AuthService.getUserById(req.userId!);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const remaining = Math.max(0, user.uploadLimit - user.uploadsUsed);
    const resetAt = user.resetDate;

    res.json({
      success: true,
      data: {
        used: user.uploadsUsed,
        limit: user.uploadLimit,
        remaining,
        resetAt,
        tier: user.tier
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Refresh token
router.post('/refresh', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const newToken = AuthService.generateToken(req.userId!);
    
    res.json({
      success: true,
      data: {
        token: newToken,
        expiresIn: '7d'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Logout (client-side token removal, server-side logging)
router.post('/logout', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    // Log logout
    await db.insert(auditLogs).values({
      userId: req.userId,
      action: 'user_logout',
      resource: 'user',
      resourceId: req.userId!,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;