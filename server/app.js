const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const jwt = require('jsonwebtoken');
const multer = require('multer');
const crypto = require('crypto');
const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Create necessary directories
const initDirectories = async () => {
  const dirs = ['storage', 'storage/uploads', 'storage/outputs', 'logs'];
  for (const dir of dirs) {
    try {
      await fs.mkdir(path.join(__dirname, '..', dir), { recursive: true });
    } catch (err) {
      console.log(`Directory ${dir} already exists or created`);
    }
  }
};

// Redis connection setup
let redis = null;
let renderQueue = null;

const setupRedis = async () => {
  try {
    if (process.env.REDIS_URL && !process.env.DISABLE_UPSTASH_AUTOCREATE) {
      redis = new Redis(process.env.REDIS_URL);
      renderQueue = new Queue('render', { connection: redis });
      console.log('✅ Connected to Redis queue');
    } else if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      // Use Upstash REST API
      redis = new Redis({
        host: process.env.UPSTASH_REDIS_REST_URL.replace('https://', '').replace('http://', ''),
        port: 6379,
        password: process.env.UPSTASH_REDIS_REST_TOKEN,
        tls: process.env.UPSTASH_REDIS_REST_URL.startsWith('https') ? {} : undefined
      });
      renderQueue = new Queue('render', { connection: redis });
      console.log('✅ Connected to Upstash Redis');
    } else {
      // Fallback to in-memory queue
      console.log('⚠️  Using in-memory queue (Redis not configured)');
      renderQueue = {
        add: async (name, data) => {
          const jobId = crypto.randomUUID();
          // Simulate async processing
          setTimeout(async () => {
            await processRenderJob({ id: jobId, data });
          }, 2000);
          return { id: jobId };
        }
      };
    }
  } catch (error) {
    console.error('Redis connection failed:', error);
    // Fallback to in-memory processing
    renderQueue = {
      add: async (name, data) => {
        const jobId = crypto.randomUUID();
        setTimeout(async () => {
          await processRenderJob({ id: jobId, data });
        }, 2000);
        return { id: jobId };
      }
    };
  }
};

// Job storage (in-memory for development)
const jobs = new Map();

// Template storage
const templates = new Map();

// User storage
const users = new Map();

// Audit log
const auditLog = [];

// Initialize sample data
const initSampleData = () => {
  // Sample templates
  templates.set('1', {
    id: '1',
    name: 'Viral Dance Effect',
    metadata: {
      transitions: ['fade', 'zoom'],
      effects: ['blur', 'colorpop'],
      textOverlays: [{ text: 'Viral!', position: 'center', duration: 2 }],
      audioSync: { beatDetection: true, tempo: 128 }
    },
    createdAt: new Date().toISOString()
  });

  // Test user
  users.set('test@example.com', {
    id: '1',
    email: 'test@example.com',
    tier: 'free',
    password: 'password' // In production, hash this
  });
};

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default-secret', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Upload configuration
const upload = multer({ 
  dest: path.join(__dirname, '../storage/uploads'),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Skify Core API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    status: 'operational'
  });
});

// Authentication
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (users.has(email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const userId = crypto.randomUUID();
    users.set(email, {
      id: userId,
      email,
      password, // In production, hash this
      tier: 'free',
      createdAt: new Date().toISOString()
    });

    const token = jwt.sign({ userId, email }, process.env.JWT_SECRET || 'default-secret');
    
    auditLog.push({
      event: 'user_signup',
      userId,
      timestamp: new Date().toISOString(),
      metadata: { email }
    });

    res.json({ success: true, token, user: { id: userId, email, tier: 'free' } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = users.get(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, email }, process.env.JWT_SECRET || 'default-secret');
    
    auditLog.push({
      event: 'user_login',
      userId: user.id,
      timestamp: new Date().toISOString(),
      metadata: { email }
    });

    res.json({ 
      success: true, 
      token, 
      user: { id: user.id, email: user.email, tier: user.tier } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload endpoints
app.post('/api/upload/sign', authenticateToken, async (req, res) => {
  try {
    const { filename, contentType } = req.body;
    
    // Generate signed URL (stubbed for S3)
    const uploadId = crypto.randomUUID();
    const signedUrl = `${process.env.APP_BASE_URL || 'http://localhost:5000'}/api/upload/direct/${uploadId}`;
    
    res.json({
      success: true,
      uploadId,
      signedUrl,
      expiresIn: 3600
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/upload/direct/:uploadId', upload.single('file'), async (req, res) => {
  try {
    const { uploadId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Move file to permanent location
    const filename = `${uploadId}_${req.file.originalname}`;
    const destPath = path.join(__dirname, '../storage/outputs', filename);
    await fs.rename(req.file.path, destPath);

    res.json({
      success: true,
      uploadId,
      filename,
      size: req.file.size,
      url: `/api/files/${filename}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/upload/complete', authenticateToken, async (req, res) => {
  try {
    const { uploadId, videoUrl } = req.body;
    
    // Trigger analysis
    const analysisJob = await renderQueue.add('analyze', {
      uploadId,
      videoUrl,
      userId: req.user.userId
    });

    jobs.set(analysisJob.id, {
      id: analysisJob.id,
      type: 'analyze',
      status: 'processing',
      progress: 0,
      createdAt: new Date().toISOString(),
      userId: req.user.userId
    });

    auditLog.push({
      event: 'upload_complete',
      userId: req.user.userId,
      timestamp: new Date().toISOString(),
      metadata: { uploadId, jobId: analysisJob.id }
    });

    res.json({
      success: true,
      jobId: analysisJob.id,
      status: 'processing'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analysis endpoint
app.post('/api/analyze', authenticateToken, async (req, res) => {
  try {
    const { videoUrl, uploadId } = req.body;

    if (process.env.AI_ANALYZE_ENDPOINT && process.env.AI_API_KEY) {
      // Real AI analysis (stubbed)
      const analysisResult = {
        style: {
          transitions: ['fade', 'zoom', 'slide'],
          effects: ['blur', 'sharpen', 'colorpop'],
          colorGrading: { saturation: 1.2, contrast: 1.1, brightness: 0.05 },
          textOverlays: [
            { text: 'Viral Content!', position: 'center', duration: 2, font: 'Arial Bold' }
          ],
          audioSync: { beatDetection: true, tempo: 128, energy: 0.8 }
        },
        confidence: 0.92,
        processingTime: 1.5
      };

      res.json({ success: true, analysis: analysisResult });
    } else {
      // Deterministic stub
      const stubAnalysis = {
        style: {
          transitions: ['crossfade', 'zoom', 'pan'],
          effects: ['blur', 'glow', 'colorpop'],
          colorGrading: { saturation: 1.3, contrast: 1.2, brightness: 0.1 },
          textOverlays: [
            { text: 'Amazing!', position: 'top', duration: 3, font: 'Impact' },
            { text: 'Like & Share', position: 'bottom', duration: 2, font: 'Arial' }
          ],
          audioSync: { beatDetection: true, tempo: 120, energy: 0.9 }
        },
        confidence: 0.85,
        processingTime: 0.5
      };

      res.json({ success: true, analysis: stubAnalysis });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Template endpoints
app.post('/api/template', authenticateToken, async (req, res) => {
  try {
    const { name, metadata } = req.body;
    
    const templateId = crypto.randomUUID();
    const template = {
      id: templateId,
      name,
      metadata,
      userId: req.user.userId,
      createdAt: new Date().toISOString()
    };

    templates.set(templateId, template);

    auditLog.push({
      event: 'template_created',
      userId: req.user.userId,
      timestamp: new Date().toISOString(),
      metadata: { templateId, name }
    });

    res.json({ success: true, template });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/templates', (req, res) => {
  try {
    const templateList = Array.from(templates.values()).map(t => ({
      id: t.id,
      name: t.name,
      createdAt: t.createdAt,
      metadata: t.metadata
    }));

    res.json({ success: true, templates: templateList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Template apply endpoint
app.post('/api/template/apply', authenticateToken, async (req, res) => {
  try {
    const { templateId, videoUrl, options = {} } = req.body;
    
    const template = templates.get(templateId);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const user = users.get(req.user.email);
    const renderJob = await renderQueue.add('render', {
      templateId,
      videoUrl,
      userId: req.user.userId,
      userTier: user?.tier || 'free',
      options
    });

    jobs.set(renderJob.id, {
      id: renderJob.id,
      type: 'render',
      status: 'queued',
      progress: 0,
      templateId,
      userId: req.user.userId,
      createdAt: new Date().toISOString()
    });

    auditLog.push({
      event: 'template_apply_started',
      userId: req.user.userId,
      timestamp: new Date().toISOString(),
      metadata: { templateId, jobId: renderJob.id }
    });

    res.json({
      success: true,
      jobId: renderJob.id,
      status: 'queued'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Job status endpoint
app.get('/api/job/:id', (req, res) => {
  try {
    const job = jobs.get(req.params.id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// File serving
app.get('/api/files/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../storage/outputs', req.params.filename);
  res.sendFile(filePath);
});

// Razorpay integration
app.post('/api/payment/order', authenticateToken, async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ error: 'Razorpay not configured' });
    }

    // Stub order creation
    const orderId = `order_${crypto.randomUUID()}`;
    
    auditLog.push({
      event: 'payment_order_created',
      userId: req.user.userId,
      timestamp: new Date().toISOString(),
      metadata: { orderId, amount }
    });

    res.json({
      success: true,
      orderId,
      amount,
      currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/webhook/razorpay', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    
    // Verify signature (stubbed)
    if (process.env.RAZORPAY_KEY_SECRET) {
      // In production, verify the signature
      console.log('Razorpay webhook received:', req.body);
    }

    // Update user tier
    const { payment_id, order_id } = req.body;
    
    auditLog.push({
      event: 'payment_completed',
      timestamp: new Date().toISOString(),
      metadata: { payment_id, order_id }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin endpoints
app.get('/api/admin/audit', (req, res) => {
  try {
    const recent = auditLog.slice(-100); // Last 100 events
    res.json({ success: true, events: recent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/moderation', (req, res) => {
  try {
    const stats = {
      totalJobs: jobs.size,
      totalTemplates: templates.size,
      totalUsers: users.size,
      recentEvents: auditLog.length
    };
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Job processing function
const processRenderJob = async (job) => {
  try {
    console.log(`Processing job ${job.id}:`, job.data);
    
    const jobData = jobs.get(job.id);
    if (jobData) {
      // Simulate processing stages
      jobs.set(job.id, { ...jobData, status: 'processing', progress: 25 });
      
      setTimeout(() => {
        jobs.set(job.id, { ...jobData, status: 'processing', progress: 50 });
      }, 1000);
      
      setTimeout(() => {
        jobs.set(job.id, { ...jobData, status: 'processing', progress: 75 });
      }, 2000);
      
      setTimeout(() => {
        const resultUrl = `/api/files/result_${job.id}.mp4`;
        jobs.set(job.id, { 
          ...jobData, 
          status: 'completed', 
          progress: 100, 
          resultUrl,
          completedAt: new Date().toISOString()
        });
      }, 3000);
    }
  } catch (error) {
    console.error('Job processing error:', error);
    const jobData = jobs.get(job.id);
    if (jobData) {
      jobs.set(job.id, { ...jobData, status: 'failed', error: error.message });
    }
  }
};

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Initialize and start server
const startServer = async () => {
  try {
    await initDirectories();
    await setupRedis();
    initSampleData();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Skify Core server running on http://0.0.0.0:${PORT}`);
      console.log(`📱 PWA available at: http://localhost:${PORT}`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;