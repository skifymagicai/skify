import express from 'express';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video and image files allowed'));
    }
  }
});

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-memory storage for demo
const jobs = new Map();
const templates = new Map();
const analysis = new Map();

// Initialize with sample templates
templates.set('1', {
  id: '1',
  name: 'Viral Dance Moves',
  thumbnailUrl: '/api/placeholder/300x533',
  duration: '0:15',
  createdAt: new Date().toISOString(),
  uses: 12,
  rating: 4.8,
  tags: ['dance', 'viral', 'transitions'],
  metadata: {
    aspectRatio: '9:16',
    effects: 8,
    textOverlays: 2,
    sourceVideo: 'TikTok viral dance'
  }
});

templates.set('2', {
  id: '2',
  name: 'Text Animation Style',
  thumbnailUrl: '/api/placeholder/300x533',
  duration: '0:30',
  createdAt: new Date().toISOString(),
  uses: 8,
  rating: 4.6,
  tags: ['text', 'animation', 'trendy'],
  metadata: {
    aspectRatio: '9:16',
    effects: 5,
    textOverlays: 6,
    sourceVideo: 'Instagram Reel'
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Skify API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    res.json({
      success: true,
      data: {
        fileId: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        path: req.file.path
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Analyze viral video endpoint
app.post('/api/analyze', (req, res) => {
  try {
    const { videoUrl, videoLink } = req.body;
    
    if (!videoUrl && !videoLink) {
      return res.status(400).json({
        success: false,
        error: 'Video URL or link required'
      });
    }

    const analysisId = `analysis-${Date.now()}`;
    const analysisData = {
      id: analysisId,
      videoSource: videoUrl || videoLink,
      status: 'completed',
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
            tint: 'magenta'
          },
          effects: ['motion_blur', 'vignette', 'lens_flare'],
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
              timing: { start: 1, end: 4 }
            }
          ]
        },
        audio: {
          bpm: 128,
          key: 'C Major',
          beatMap: [0, 0.47, 0.94, 1.41, 1.88, 2.35, 2.82],
          musicCues: [
            { type: 'drop', timing: 2.1 },
            { type: 'build', timing: 6.8 }
          ]
        }
      }
    };

    analysis.set(analysisId, analysisData);

    res.json({
      success: true,
      data: {
        analysisId,
        status: 'completed',
        analysis: analysisData.styleExtraction
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Template endpoints
app.get('/api/templates', (req, res) => {
  try {
    const templateList = Array.from(templates.values());
    
    res.json({
      success: true,
      data: {
        templates: templateList,
        pagination: {
          page: 1,
          limit: 20,
          total: templateList.length
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

app.post('/api/templates/apply', (req, res) => {
  try {
    const { templateId, userMedia, customizations } = req.body;
    
    if (!templateId || !userMedia) {
      return res.status(400).json({
        success: false,
        error: 'Template ID and user media required'
      });
    }

    const jobId = `job-${Date.now()}`;
    const jobData = {
      id: jobId,
      templateId,
      userMedia,
      customizations,
      status: 'processing',
      progress: 0,
      createdAt: new Date().toISOString()
    };

    jobs.set(jobId, jobData);

    // Simulate processing
    setTimeout(() => {
      const job = jobs.get(jobId);
      if (job) {
        job.status = 'completed';
        job.progress = 100;
        job.resultUrl = `/api/result/${jobId}`;
        jobs.set(jobId, job);
      }
    }, 5000);

    res.json({
      success: true,
      data: {
        jobId,
        status: 'processing',
        message: 'Template application started'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Job status endpoint
app.get('/api/job/:jobId', (req, res) => {
  try {
    const { jobId } = req.params;
    const job = jobs.get(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: {
        jobId: job.id,
        status: job.status,
        progress: job.progress,
        resultUrl: job.resultUrl,
        createdAt: job.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

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
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// Start server
const server = createServer(app);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Skify server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;