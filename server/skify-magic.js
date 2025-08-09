import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { videoAnalysisQueue, templateApplicationQueue, RedisCache } from './queue/redis.js';
import './workers/analysis.js';
import './workers/template.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// File upload handling
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed!'));
    }
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SkifyMagicAI API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    redis: process.env.REDIS_URL ? 'connected' : 'local'
  });
});

// 1. VIRAL VIDEO ANALYSIS - Queue-based
app.post('/api/analyze', async (req, res) => {
  try {
    const { videoUrl, link, options = {} } = req.body;
    
    if (!videoUrl && !link) {
      return res.status(400).json({
        success: false,
        error: 'Video URL or link required'
      });
    }
    
    const url = videoUrl || link;
    
    // Add job to analysis queue
    const job = await videoAnalysisQueue.add('analyze-video', {
      videoUrl: url,
      options
    });
    
    res.json({
      success: true,
      data: {
        jobId: job.id,
        status: 'queued',
        message: 'Video analysis started',
        estimatedTime: '10-30 seconds'
      }
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 2. SAVED TEMPLATES LIBRARY - CRUD Operations
app.get('/api/templates', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;
    
    // Get from cache or generate
    const cacheKey = `templates:${page}:${limit}:${category || ''}:${search || ''}`;
    let templatesData = await RedisCache.get(cacheKey);
    
    if (!templatesData) {
      // Generate mock templates with comprehensive data
      const templates = Array.from({ length: parseInt(limit) }, (_, i) => {
        const id = ((parseInt(page) - 1) * parseInt(limit)) + i + 1;
        return {
          id: id.toString(),
          name: [
            'Viral Dance Moves', 'Text Animation Style', 'Color Pop Effect', 
            'Smooth Transitions', 'Beat Drop Sync', 'Cinematic Filter',
            'Neon Glow Style', 'Retro VHS Effect', 'Glitch Transitions',
            'Speed Ramp Style'
          ][id % 10],
          thumbnailUrl: `/api/placeholder/300x533`,
          duration: `0:${10 + (id % 20)}`,
          createdAt: new Date(Date.now() - id * 86400000).toISOString(),
          uses: Math.floor(Math.random() * 100),
          rating: (4 + Math.random()).toFixed(1),
          tags: [
            ['dance', 'viral', 'transitions'],
            ['text', 'animation', 'trendy'],
            ['color', 'effects', 'pop'],
            ['smooth', 'professional', 'cinematic'],
            ['music', 'sync', 'beat'],
            ['cinematic', 'color', 'grade']
          ][id % 6],
          metadata: {
            aspectRatio: '9:16',
            effects: Math.floor(Math.random() * 10) + 1,
            textOverlays: Math.floor(Math.random() * 5),
            sourceVideo: ['TikTok viral dance', 'Instagram Reel', 'YouTube Short'][Math.floor(Math.random() * 3)]
          }
        };
      });
      
      templatesData = {
        templates,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 100
        }
      };
      
      // Cache for 10 minutes
      await RedisCache.set(cacheKey, templatesData, 600);
    }
    
    res.json({
      success: true,
      data: templatesData
    });
    
  } catch (error) {
    console.error('Templates error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 3. APPLY TEMPLATE - Queue-based
app.post('/api/templates/apply', upload.array('userMedia', 10), async (req, res) => {
  try {
    const { templateId, quality = 'hd' } = req.body;
    const userMedia = req.files?.map(file => file.path) || JSON.parse(req.body.userMedia || '[]');
    
    if (!templateId || userMedia.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Template ID and user media required'
      });
    }
    
    // Add job to template application queue
    const job = await templateApplicationQueue.add('apply-template', {
      templateId,
      userMedia,
      options: { quality }
    });
    
    res.json({
      success: true,
      data: {
        jobId: job.id,
        status: 'queued',
        message: 'Template application started',
        estimatedTime: quality === '4k' ? '2-5 minutes' : '30-60 seconds'
      }
    });
    
  } catch (error) {
    console.error('Template application error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 4. JOB STATUS TRACKING
app.get('/api/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Try to get from cache first
    const cachedResult = await RedisCache.get(`job:${jobId}`);
    if (cachedResult) {
      return res.json({
        success: true,
        data: {
          jobId,
          ...cachedResult
        }
      });
    }
    
    // Get from analysis queue
    let job = await videoAnalysisQueue.getJob(jobId);
    if (!job) {
      // Try template queue
      job = await templateApplicationQueue.getJob(jobId);
    }
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }
    
    const state = await job.getState();
    const progress = job.progress;
    
    res.json({
      success: true,
      data: {
        jobId,
        status: state,
        progress,
        createdAt: new Date(job.timestamp).toISOString(),
        data: job.returnvalue || null
      }
    });
    
  } catch (error) {
    console.error('Job status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 5. RAZORPAY INTEGRATION - Pro Tier
app.post('/api/payment/create-order', (req, res) => {
  try {
    const { plan = 'pro', amount = 2999 } = req.body; // ₹29.99
    
    const order = {
      id: `order_${Date.now()}`,
      entity: 'order',
      amount: amount * 100, // Convert to paisa
      amount_paid: 0,
      amount_due: amount * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      status: 'created',
      created_at: Math.floor(Date.now() / 1000)
    };
    
    res.json({
      success: true,
      data: {
        order,
        keyId: process.env.RAZORPAY_KEY_ID,
        options: {
          key: process.env.RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: 'SkifyMagicAI',
          description: `${plan.toUpperCase()} Plan Subscription`,
          order_id: order.id,
          theme: {
            color: '#6366f1'
          }
        }
      }
    });
    
  } catch (error) {
    console.error('Payment order error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/payment/verify', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Mock payment verification (in production, use crypto to verify signature)
    res.json({
      success: true,
      data: {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        status: 'verified',
        subscriptionTier: 'pro',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        features: [
          '4K Ultra HD export',
          'Unlimited templates',
          'Priority processing',
          'Advanced AI models',
          'No watermark'
        ]
      }
    });
    
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 6. DOWNLOAD ENDPOINTS
app.get('/api/download/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { format = 'mp4', quality = 'hd' } = req.query;
    
    // Get job result
    const result = await RedisCache.get(`job:${jobId}`);
    if (!result || result.status !== 'completed') {
      return res.status(404).json({
        success: false,
        error: 'Job not found or not completed'
      });
    }
    
    res.json({
      success: true,
      data: {
        downloadUrl: `/static/exports/skify-magic-${jobId}.${format}`,
        fileSize: quality === '4k' ? '24.8 MB' : '8.3 MB',
        format: String(format).toUpperCase(),
        quality: String(quality).toUpperCase(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Static files
app.use('/static', express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API placeholder for images
app.get('/api/placeholder/:dimensions', (req, res) => {
  const { dimensions } = req.params;
  const [width, height] = dimensions.split('x').map(Number);
  
  res.json({
    placeholder: true,
    width,
    height,
    url: `https://picsum.photos/${width}/${height}?random=${Date.now()}`
  });
});

// PWA - Serve React frontend
app.use(express.static(path.join(__dirname, '../public'), {
  index: false,
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Service Worker
app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Service-Worker-Allowed', '/');
  res.sendFile(path.join(__dirname, '../public/sw.js'));
});

// SPA fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      error: 'API endpoint not found'
    });
  }
  
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SkifyMagicAI running on port ${PORT}`);
  console.log(`📱 PWA available at: http://localhost:${PORT}`);
  console.log(`🔥 Redis connection: ${process.env.REDIS_URL ? 'Upstash' : 'Local'}`);
});

export default app;