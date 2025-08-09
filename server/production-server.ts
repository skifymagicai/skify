import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer } from 'http';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for video uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video and image files are allowed'));
    }
  }
});

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for correct IP addresses
app.set('trust proxy', 1);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Skify AI Video Transform API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: ['AI Style Extraction', 'Viral Template Application', 'PWA Support', '4K Enhancement']
  });
});

// API Routes for End-to-End User Experience

// 1. VIRAL VIDEO INPUT - Upload or Link
app.post('/api/viral/analyze', upload.single('video'), async (req, res) => {
  try {
    const { videoUrl, videoLink } = req.body;
    const uploadedFile = req.file;
    
    if (!uploadedFile && !videoUrl && !videoLink) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a video file, URL, or social media link'
      });
    }

    const jobId = `viral-analysis-${Date.now()}`;
    const videoSource = uploadedFile?.path || videoUrl || videoLink;

    // Mock comprehensive AI analysis (Production: Use Replicate API)
    const analysisResult = {
      videoMetadata: {
        duration: '0:15',
        aspectRatio: '9:16',
        resolution: '1080x1920',
        fps: 30,
        fileSize: uploadedFile?.size || '2.4MB'
      },
      styleExtraction: {
        timing: {
          cuts: [0, 3.5, 7.2, 11.8, 15],
          speedRamps: [
            { start: 0, end: 2, speed: 1.0 },
            { start: 2, end: 4, speed: 0.5 },
            { start: 4, end: 8, speed: 1.2 },
            { start: 8, end: 15, speed: 1.0 }
          ],
          keyMoments: [1.5, 5.2, 9.8, 13.1]
        },
        visual: {
          colorGrading: {
            brightness: 15,
            contrast: 25,
            saturation: 35,
            temperature: 'warm',
            tint: 'magenta',
            shadows: -20,
            highlights: 30
          },
          effects: [
            'motion_blur', 'chromatic_aberration', 'film_grain', 
            'vignette', 'lens_flare', 'shake_transition'
          ],
          transitions: [
            { type: 'zoom_in', timing: 3.5 },
            { type: 'slide_left', timing: 7.2 },
            { type: 'spin_blur', timing: 11.8 }
          ]
        },
        text: {
          overlays: [
            {
              text: 'VIRAL MOMENT',
              font: 'Montserrat-Bold',
              size: 42,
              color: '#FFFFFF',
              position: { x: 'center', y: 'top-third' },
              animation: 'bounce_in',
              timing: { start: 1, end: 4 },
              stroke: { color: '#000000', width: 2 }
            },
            {
              text: 'TRENDING NOW 🔥',
              font: 'Inter-Black',
              size: 36,
              color: '#FF6B6B',
              position: { x: 'center', y: 'bottom-third' },
              animation: 'slide_up',
              timing: { start: 8, end: 12 }
            }
          ],
          lyricSync: {
            enabled: true,
            karaoke: true,
            highlightColor: '#FFD93D',
            segments: [
              { text: 'This is how we do it', start: 0.5, end: 2.8 },
              { text: 'Making moves like this', start: 4.1, end: 6.5 },
              { text: 'Never gonna stop', start: 8.2, end: 10.9 },
              { text: 'We are unstoppable', start: 12.1, end: 15.0 }
            ]
          }
        },
        audio: {
          bpm: 128,
          key: 'C Major',
          beatMap: [0, 0.47, 0.94, 1.41, 1.88, 2.35, 2.82, 3.29, 3.76, 4.23, 4.70],
          musicCues: [
            { type: 'drop', timing: 2.1 },
            { type: 'build', timing: 6.8 },
            { type: 'break', timing: 10.5 }
          ],
          vocals: {
            present: true,
            segments: [
              { start: 0.5, end: 2.8, intensity: 'medium' },
              { start: 4.1, end: 6.5, intensity: 'high' },
              { start: 8.2, end: 15.0, intensity: 'high' }
            ]
          }
        },
        backgroundEffects: {
          masking: true,
          backgroundChanges: [
            { timing: 0, type: 'gradient', colors: ['#FF6B6B', '#4ECDC4'] },
            { timing: 7.2, type: 'particle_system', style: 'sparkles' },
            { timing: 11.8, type: 'solid', color: '#1A1A1A' }
          ]
        }
      }
    };

    res.json({
      success: true,
      data: {
        jobId,
        status: 'completed',
        progress: 100,
        videoSource,
        analysis: analysisResult,
        templateReady: true,
        message: 'Viral style extraction completed successfully'
      }
    });
  } catch (error) {
    console.error('Viral analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze viral video'
    });
  }
});

// 2. USER MEDIA UPLOAD - Multiple files support
app.post('/api/user/upload', upload.array('media', 10), (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please upload at least one media file'
      });
    }

    const uploadedMedia = files.map(file => ({
      id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
      filename: file.originalname,
      path: file.path,
      type: file.mimetype.startsWith('video/') ? 'video' : 'image',
      size: file.size,
      duration: file.mimetype.startsWith('video/') ? 'auto-detect' : null,
      thumbnailUrl: `/api/thumbnail/${file.filename}`
    }));

    res.json({
      success: true,
      data: {
        uploadedMedia,
        totalFiles: files.length,
        message: 'Media uploaded successfully'
      }
    });
  } catch (error) {
    console.error('Media upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload media'
    });
  }
});

// 3. TEMPLATE APPLICATION - Apply viral style to user media
app.post('/api/viral/apply-template', (req, res) => {
  try {
    const { templateId, userMediaIds, customizations } = req.body;
    
    if (!templateId || !userMediaIds || userMediaIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Template ID and user media are required'
      });
    }

    const jobId = `apply-template-${Date.now()}`;
    
    // Mock application process with detailed progress
    const applicationSteps = [
      'Analyzing user media compatibility',
      'Applying timing and cuts',
      'Matching speed ramps and transitions',
      'Applying color grading and filters',
      'Syncing text overlays and animations',
      'Processing audio and beat mapping',
      'Applying background effects and masking',
      'Rendering final video',
      'Optimizing output quality'
    ];

    res.json({
      success: true,
      data: {
        jobId,
        status: 'processing',
        progress: 0,
        currentStep: applicationSteps[0],
        totalSteps: applicationSteps.length,
        estimatedTime: '45-90 seconds',
        message: 'Template application started'
      }
    });
  } catch (error) {
    console.error('Template application error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to apply template'
    });
  }
});

// 4. JOB STATUS TRACKING - Real-time progress
app.get('/api/job/:jobId/status', (req, res) => {
  const { jobId } = req.params;
  
  // Mock progressive status updates
  const mockProgress = Math.min(100, (Date.now() % 60000) / 600); // Simulates 0-100% over 60 seconds
  const isCompleted = mockProgress >= 99;
  
  if (isCompleted) {
    res.json({
      success: true,
      data: {
        jobId,
        status: 'completed',
        progress: 100,
        currentStep: 'Processing complete',
        result: {
          videoUrl: `/api/video/${jobId}/result.mp4`,
          thumbnailUrl: `/api/thumbnail/${jobId}/thumb.jpg`,
          downloadUrl: `/api/download/${jobId}`,
          streamUrl: `/api/stream/${jobId}`,
          metadata: {
            duration: '0:15',
            aspectRatio: '9:16',
            resolution: '1080x1920',
            fileSize: '3.2 MB',
            format: 'MP4',
            codec: 'H.264',
            effects: 8,
            textOverlays: 3,
            audioSync: true,
            quality: 'HD'
          },
          enhancementOptions: {
            available: true,
            '4k_ultra_hd': {
              enabled: false, // Pro feature
              price: 0, // Free for Pro users
              estimatedTime: '2-3 minutes'
            }
          }
        }
      }
    });
  } else {
    res.json({
      success: true,
      data: {
        jobId,
        status: 'processing',
        progress: Math.floor(mockProgress),
        currentStep: 'Applying viral template effects...',
        estimatedTimeRemaining: `${Math.ceil((100 - mockProgress) * 0.6)} seconds`
      }
    });
  }
});

// 5. SAVED TEMPLATES LIBRARY - CRUD Operations
app.get('/api/templates/my-templates', (req, res) => {
  const mockUserTemplates = [
    {
      id: 'user-template-1',
      name: 'My Viral Dance Style',
      thumbnailUrl: '/api/placeholder/300x533',
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      sourceVideo: 'TikTok @username',
      uses: 5,
      duration: '0:15',
      tags: ['dance', 'trending', 'personal'],
      isCustom: true,
      canEdit: true
    },
    {
      id: 'user-template-2',
      name: 'Text Animation Pro',
      thumbnailUrl: '/api/placeholder/300x533',
      createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      sourceVideo: 'Instagram Reel',
      uses: 12,
      duration: '0:30',
      tags: ['text', 'animation', 'professional'],
      isCustom: true,
      canEdit: true
    }
  ];

  res.json({
    success: true,
    data: {
      templates: mockUserTemplates,
      pagination: {
        page: 1,
        limit: 20,
        total: mockUserTemplates.length
      }
    }
  });
});

app.post('/api/templates/save', (req, res) => {
  const { name, templateData, tags } = req.body;
  
  const newTemplate = {
    id: `user-template-${Date.now()}`,
    name: name || 'Unnamed Template',
    thumbnailUrl: '/api/placeholder/300x533',
    createdAt: new Date().toISOString(),
    sourceVideo: 'Custom Creation',
    uses: 0,
    duration: templateData?.duration || '0:15',
    tags: tags || ['custom'],
    isCustom: true,
    canEdit: true,
    templateData
  };

  res.json({
    success: true,
    data: {
      template: newTemplate,
      message: 'Template saved successfully'
    }
  });
});

// 6. PRO TIER FEATURES - 4K Enhancement
app.post('/api/enhance/4k-ultra-hd', (req, res) => {
  const { videoId, subscriptionTier } = req.body;
  
  if (subscriptionTier !== 'pro') {
    return res.status(403).json({
      success: false,
      error: 'Pro subscription required for 4K Ultra HD enhancement',
      upgradeUrl: '/upgrade-to-pro'
    });
  }

  const enhancementJobId = `enhance-4k-${Date.now()}`;
  
  res.json({
    success: true,
    data: {
      jobId: enhancementJobId,
      status: 'processing',
      progress: 0,
      estimatedTime: '2-3 minutes',
      outputQuality: '4K Ultra HD (3840x2160)',
      message: 'Starting cinematic 4K enhancement'
    }
  });
});

// 7. PAYMENT INTEGRATION - Razorpay Mock
app.post('/api/payments/create-order', (req, res) => {
  const { plan, amount } = req.body;
  
  const orderId = `order_${Date.now()}`;
  
  res.json({
    success: true,
    data: {
      orderId,
      amount: amount * 100, // Razorpay uses paise
      currency: 'INR',
      plan,
      keyId: 'rzp_test_mock_key', // Mock Razorpay key
      message: 'Payment order created successfully'
    }
  });
});

app.post('/api/payments/verify', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
  // Mock payment verification
  res.json({
    success: true,
    data: {
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      status: 'verified',
      subscriptionTier: 'pro',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      message: 'Payment verified, Pro features activated'
    }
  });
});

// 8. EXPORT & DOWNLOAD - Multiple formats
app.get('/api/download/:jobId', (req, res) => {
  const { jobId } = req.params;
  const { format = 'mp4', quality = 'hd' } = req.query;
  
  // Mock file download
  res.setHeader('Content-Disposition', `attachment; filename="skify-viral-${jobId}.${format}"`);
  res.setHeader('Content-Type', 'video/mp4');
  
  res.json({
    success: true,
    downloadUrl: `/static/exports/skify-viral-${jobId}.${format}`,
    fileSize: quality === '4k' ? '12.8 MB' : '3.2 MB',
    format: format.toUpperCase(),
    quality: quality.toUpperCase(),
    message: 'Video ready for download'
  });
});

// Serve static frontend from "dist/public" directory
app.use(express.static(path.join(__dirname, '../dist/public'), { index: false }));

// PWA Service Worker
app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, '../dist/public/sw.js'));
});

// API placeholder endpoints for missing assets
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

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ 
      success: false, 
      error: 'API endpoint not found',
      availableEndpoints: [
        '/api/viral/analyze',
        '/api/user/upload', 
        '/api/viral/apply-template',
        '/api/job/:jobId/status',
        '/api/templates/my-templates',
        '/api/enhance/4k-ultra-hd',
        '/api/payments/create-order',
        '/api/download/:jobId'
      ]
    });
  }
  
  // Serve index.html for all non-API routes (PWA SPA routing)
  res.sendFile(path.join(__dirname, '../dist/public', 'index.html'));
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size too large. Maximum size is 100MB.'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// Start server
const server = createServer(app);

server.listen(PORT, () => {
  console.log(`✅ Skify Production Server running on port ${PORT}`);
  console.log(`📱 PWA Mobile App: http://localhost:${PORT}/mobile`);
  console.log(`💻 Desktop Version: http://localhost:${PORT}/desktop`);
  console.log(`🎯 End-to-End Viral Video Transformation Ready!`);
  console.log(`🚀 Features: AI Style Extraction • Template Application • 4K Enhancement • PWA Support`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});