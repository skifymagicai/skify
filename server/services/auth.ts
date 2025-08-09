import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { db } from '../db/index.js';
import { users } from '../../shared/skify-schema.js';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export class AuthService {
  // Create new user
  static async createUser(userData: {
    username: string;
    email: string;
    password: string;
  }) {
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Set upload quotas based on tier
    const uploadLimit = 5; // Free tier limit
    const resetDate = new Date();
    resetDate.setDate(resetDate.getDate() + 1); // Reset tomorrow

    const [user] = await db.insert(users).values({
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      tier: 'free',
      uploadLimit,
      uploadsUsed: 0,
      resetDate,
      isActive: true
    }).returning({
      id: users.id,
      username: users.username,
      email: users.email,
      tier: users.tier,
      uploadLimit: users.uploadLimit,
      uploadsUsed: users.uploadsUsed,
      resetDate: users.resetDate,
      isActive: users.isActive,
      createdAt: users.createdAt
    });

    return user;
  }

  // Authenticate user
  static async authenticateUser(email: string, password: string) {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user || !user.isActive) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await db.update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      tier: user.tier,
      uploadLimit: user.uploadLimit,
      uploadsUsed: user.uploadsUsed,
      resetDate: user.resetDate,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLoginAt: new Date()
    };
  }

  // Get user by ID
  static async getUserById(userId: string) {
    const [user] = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      tier: users.tier,
      subscriptionId: users.subscriptionId,
      uploadLimit: users.uploadLimit,
      uploadsUsed: users.uploadsUsed,
      resetDate: users.resetDate,
      isActive: users.isActive,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

    return user;
  }

  // Generate JWT token
  static generateToken(userId: string): string {
    return jwt.sign(
      { userId, timestamp: Date.now() },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  // Verify JWT token
  static verifyToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Check and increment upload usage
  static async incrementUploadUsage(userId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if quota needs reset
    const now = new Date();
    if (now > user.resetDate) {
      // Reset quota
      const newResetDate = new Date();
      newResetDate.setDate(newResetDate.getDate() + 1);
      
      await db.update(users)
        .set({
          uploadsUsed: 1,
          resetDate: newResetDate
        })
        .where(eq(users.id, userId));
      
      return true;
    }

    // Check if user has quota remaining
    if (user.uploadsUsed >= user.uploadLimit) {
      return false; // Quota exceeded
    }

    // Increment usage
    await db.update(users)
      .set({ uploadsUsed: user.uploadsUsed + 1 })
      .where(eq(users.id, userId));

    return true;
  }

  // Update user tier (for payments)
  static async updateUserTier(
    userId: string, 
    tier: 'free' | 'pro', 
    subscriptionId?: string
  ) {
    const updateData: any = {
      tier,
      updatedAt: new Date()
    };

    if (tier === 'pro') {
      updateData.uploadLimit = 999999; // Unlimited
      updateData.subscriptionId = subscriptionId;
    } else {
      updateData.uploadLimit = 5; // Free tier
      updateData.subscriptionId = null;
    }

    await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId));
  }
}

// Authentication middleware
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const decoded = AuthService.verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

// Optional authentication middleware
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = AuthService.verifyToken(token);
      req.userId = decoded.userId;
    }
  } catch (error) {
    // Ignore auth errors for optional auth
  }
  next();
};