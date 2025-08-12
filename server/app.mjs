import express from 'express';
import path from 'path';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { promises as fs } from 'fs';
import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import Razorpay from 'razorpay';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

import net from 'net';
async function checkPortInUse(port) {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', err => {
        if (err.code === 'EADDRINUSE') resolve(true);
        else resolve(false);
      })
      .once('listening', () => {
        tester.close();
        resolve(false);
      })
      .listen(port);
  });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory (built React app)
app.use(express.static(path.join(__dirname, '..', 'public')));

// In-memory storage
const users = new Map();
const videos = new Map();
const templates = new Map();
const jobs = new Map();
const auditLog = [];

// Initialize demo user
const demoUser = {
  id: 'demo-user',
  email: 'test@example.com',
  password: bcrypt.hashSync('password', 10),
  tier: 'free',
  createdAt: new Date().toISOString()
};
users.set(demoUser.email, demoUser);

// Sample templates
const sampleTemplates = [
  {
    id: '1',
    name: 'Viral TikTok Style',
    description: 'Popular TikTok effects with transitions',
    metadata: {
      effects: ['blur', 'glow', 'sparkle'],
      transitions: ['fade', 'slide'],
      colorGrading: 'vibrant',
      duration: '15s'
    },
    createdBy: demoUser.id,
    createdAt: new Date().toISOString(),
    popularity: 95
  },
  {
    id: '2', 
    name: 'Instagram Reel Magic',
    description: 'Instagram trending effects pack',
    metadata: {
      effects: ['vintage', 'bokeh'],
      transitions: ['zoom', 'rotate'],
      colorGrading: 'warm',
      duration: '30s'
    },
    createdBy: demoUser.id,
    createdAt: new Date().toISOString(),
    popularity: 88
  },
  {
    id: '3',
    name: 'YouTube Short Boost',
    description: 'High-engagement YouTube effects',
    metadata: {
      effects: ['motion-blur', 'particles'],
      transitions: ['swipe', 'dissolve'],
      colorGrading: 'cinematic',
      duration: '60s'
    },
    createdBy: demoUser.id,
    createdAt: new Date().toISOString(),
    popularity: 92
  }
];

sampleTemplates.forEach(template => {
  templates.set(template.id, template);
});

// Queue setup with fallback
let videoQueue;
let renderWorker;

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Razorpay setup
let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// Helper functions
function generateJobId() {
  return 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function logAuditEvent(userId, action, details) {
  auditLog.push({
    id: Date.now().toString(),
    userId,
    action,
    details,
    timestamp: new Date().toISOString(),
    ip: '127.0.0.1'
  });
}

// Mock AI analysis function
function analyzeVideo(videoUrl) {
  const effects = ['blur', 'glow', 'sparkle', 'vintage', 'bokeh', 'motion-blur', 'particles'];
  const transitions = ['fade', 'slide', 'zoom', 'rotate', 'swipe', 'dissolve'];
  const colorGrading = ['vibrant', 'warm', 'cool', 'cinematic', 'retro'];
  
  return {
    style: {
      effects: effects.slice(0, Math.floor(Math.random() * 3) + 1),
      transitions: transitions.slice(0, Math.floor(Math.random() * 2) + 1),
      colorGrading: colorGrading[Math.floor(Math.random() * colorGrading.length)],
      pace: Math.random() > 0.5 ? 'fast' : 'medium',
      textOverlays: Math.random() > 0.7,
      musicSync: Math.random() > 0.6
    },
    confidence: 0.85 + Math.random() * 0.1,
    processingTime: Math.floor(Math.random() * 5000) + 2000
  };
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Skify Core API',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

// Authentication routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    if (users.has(email)) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      tier: 'free',
      createdAt: new Date().toISOString()
    };

    users.set(email, user);
    logAuditEvent(user.id, 'USER_SIGNUP', { email });

    const token = jwt.sign(
      { userId: user.id, email: user.email, tier: user.tier },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, tier: user.tier }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = users.get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    logAuditEvent(user.id, 'USER_LOGIN', { email });

    const token = jwt.sign(
      { userId: user.id, email: user.email, tier: user.tier },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, tier: user.tier }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload routes
app.post('/api/upload/sign', authenticateToken, (req, res) => {
  try {
    const { filename, contentType } = req.body;
    
    if (!filename || !contentType) {
      return res.status(400).json({ error: 'Filename and content type required' });
    }

    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const signedUrl = `http://localhost:${PORT}/api/upload/${uploadId}`;

    logAuditEvent(req.user.userId, 'UPLOAD_SIGNED', { filename, uploadId });

    res.json({
      success: true,
      uploadId,
      signedUrl,
      expiresIn: 3600
    });
  } catch (error) {
    console.error('Upload sign error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/upload/complete', authenticateToken, (req, res) => {
  try {
    const { uploadId, filename } = req.body;

    logAuditEvent(req.user.userId, 'UPLOAD_COMPLETED', { uploadId, filename });

    res.json({
      success: true,
      fileUrl: `http://localhost:${PORT}/uploads/${filename}`,
      uploadId
    });
  } catch (error) {
    console.error('Upload complete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Analysis route
app.post('/api/analyze', authenticateToken, async (req, res) => {
  try {
    const { videoUrl } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL required' });
    }

    logAuditEvent(req.user.userId, 'VIDEO_ANALYSIS', { videoUrl });

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const analysis = analyzeVideo(videoUrl);

    res.json({
      success: true,
      analysis,
      videoUrl
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Templates routes
app.get('/api/templates', (req, res) => {
  try {
    const templateList = Array.from(templates.values())
      .sort((a, b) => b.popularity - a.popularity);

    res.json({
      success: true,
      templates: templateList
    });
  } catch (error) {
    console.error('Templates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/template', authenticateToken, (req, res) => {
  try {
    const { name, description, metadata } = req.body;

    if (!name || !metadata) {
      return res.status(400).json({ error: 'Name and metadata required' });
    }

    const template = {
      id: Date.now().toString(),
      name,
      description: description || '',
      metadata,
      createdBy: req.user.userId,
      createdAt: new Date().toISOString(),
      popularity: 0
    };

    templates.set(template.id, template);
    logAuditEvent(req.user.userId, 'TEMPLATE_CREATED', { templateId: template.id, name });

    res.json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Template creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/template/apply', authenticateToken, async (req, res) => {
  try {
    const { templateId, videoUrl } = req.body;

    if (!templateId || !videoUrl) {
      return res.status(400).json({ error: 'Template ID and video URL required' });
    }

    const template = templates.get(templateId);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const jobId = generateJobId();
    const job = {
      id: jobId,
      userId: req.user.userId,
      templateId,
      videoUrl,
      status: 'processing',
      progress: 0,
      createdAt: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + 30000).toISOString()
    };

    jobs.set(jobId, job);
    logAuditEvent(req.user.userId, 'TEMPLATE_APPLIED', { templateId, jobId });

    // Simulate processing
    setTimeout(() => {
      job.progress = 50;
      job.status = 'rendering';
    }, 5000);

    setTimeout(() => {
      job.progress = 100;
      job.status = 'completed';
      job.outputUrl = `http://localhost:${PORT}/files/render_${jobId}.mp4`;
      job.completedAt = new Date().toISOString();
    }, 15000);

    res.json({
      success: true,
      jobId,
      estimatedTime: 30
    });
  } catch (error) {
    console.error('Template apply error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Job status route
app.get('/api/job/:id', (req, res) => {
  try {
    const jobId = req.params.id;
    const job = jobs.get(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      success: true,
      job
    });
  } catch (error) {
    console.error('Job status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Payment routes
app.post('/api/payment/order', authenticateToken, async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({ error: 'Payment service not configured' });
    }

    const { amount, currency = 'INR' } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const order = await razorpay.orders.create({
      amount: amount,
      currency: currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: req.user.userId,
        plan: 'pro'
      }
    });

    logAuditEvent(req.user.userId, 'PAYMENT_ORDER_CREATED', { orderId: order.id, amount });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Payment order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/payment/verify', authenticateToken, (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    // In a real implementation, verify the signature with Razorpay
    logAuditEvent(req.user.userId, 'PAYMENT_VERIFIED', { orderId, paymentId });

    // Upgrade user tier
    const userEmail = req.user.email;
    const user = users.get(userEmail);
    if (user) {
      user.tier = 'pro';
      user.paidAt = new Date().toISOString();
      users.set(userEmail, user);
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      tier: 'pro'
    });
  } catch (error) {
    console.error('Payment verify error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin routes
app.get('/api/admin/audit', (req, res) => {
  try {
    const events = auditLog.slice(-100).reverse(); // Latest 100 events

    res.json({
      success: true,
      events
    });
  } catch (error) {
    console.error('Admin audit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/moderation', (req, res) => {
  try {
    const stats = {
      totalUsers: users.size,
      totalVideos: videos.size,
      totalTemplates: templates.size,
      totalJobs: jobs.size,
      activeJobs: Array.from(jobs.values()).filter(job => 
        job.status === 'processing' || job.status === 'rendering'
      ).length
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Admin moderation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// File serving route
app.get('/files/:filename', (req, res) => {
  const filename = req.params.filename;
  
  // In a real implementation, serve actual files
  res.json({
    success: true,
    message: 'File download would start here',
    filename,
    note: 'This is a mock implementation'
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server

(async () => {
  if (await checkPortInUse(PORT)) {
    console.error(`❌ Port ${PORT} is already in use. Please stop the other process or set a different PORT in your .env.`);
    process.exit(1);
  }
  app.listen(PORT, () => {
    console.log(`🚀 Skify Core Server running on port ${PORT}`);
    console.log(`📱 PWA available at: http://localhost:${PORT}`);
    console.log(`🔧 API endpoints: http://localhost:${PORT}/api/*`);
    
    if (!process.env.JWT_SECRET) {
      console.log('⚠️  Using development JWT secret');
    }
    
    if (!razorpay) {
      console.log('⚠️  Razorpay not configured - payments disabled');
    } else {
      console.log('💳 Razorpay payment integration active');
    }
  });
})();

export default app;