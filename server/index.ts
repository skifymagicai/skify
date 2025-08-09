import express from 'express';
import cors from 'cors';
import { setupVite, serveStatic } from './vite.js';
import { createServer } from 'http';

// Import routes
import authRoutes from './routes/auth.ts';
import uploadRoutes from './routes/upload.ts';
import templateRoutes from './routes/templates.ts';
import jobRoutes from './routes/jobs.ts';
import paymentRoutes from './routes/payments.ts';
import adminRoutes from './routes/admin.ts';
import viralTransformRoutes from './routes/viral-transform.ts';

// Initialize queue service
import { SimpleQueueService } from './services/simple-queue.js';

const app = express();
const PORT = parseInt(process.env.PORT || '5000');

// Initialize queue service
const queueService = new SimpleQueueService();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.APP_BASE_URL 
    : ['http://localhost:5000', 'http://localhost:3000'],
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
    message: 'SkifyMagicAI API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/viral', viralTransformRoutes);

// Analysis endpoint (direct route for frontend compatibility)
app.use('/api', viralTransformRoutes);

// Direct analysis endpoint for testing
app.post('/api/analyze', (req, res) => {
  console.log('🔍 Direct analysis endpoint hit');
  
  const { videoUrl } = req.body;
  
  if (!videoUrl) {
    return res.status(400).json({ 
      success: false,
      error: 'Video URL is required' 
    });
  }
  
  // Generate mock analysis
  const mockAnalysis = {
    id: `analysis_${Date.now()}`,
    sourceType: 'url',
    sourcePath: videoUrl,
    timestamp: new Date().toISOString(),
    style: {
      effects: ['Cinematic Color Grading', 'Motion Blur', 'Dynamic Zoom'],
      transitions: ['Quick Cut', 'Fade', 'Slide'],
      colorGrading: {
        temperature: -50,
        saturation: 1.2,
        contrast: 1.1,
        highlights: -10,
        shadows: 15
      },
      cameraMotion: ['Pan Left', 'Zoom In'],
      textOverlays: [
        {
          text: 'VIRAL CONTENT',
          position: 'center',
          duration: 2.5,
          font: 'Impact',
          style: 'bold'
        }
      ]
    },
    audio: {
      energy: 0.85,
      tempo: 128,
      key: 'C',
      genre: 'Electronic'
    },
    metadata: {
      duration: 30,
      resolution: '1920x1080',
      fps: 30,
      fileSize: 25000000,
      bitrate: '8000 kbps'
    },
    confidence: 0.89,
    processingTime: 2500
  };
  
  res.json({
    success: true,
    analysis: mockAnalysis,
    message: 'Video analysis completed successfully',
    templateSuggestions: ['Viral TikTok Style', 'Cinematic YouTube']
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON payload'
    });
  }

  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found'
  });
});

// Start server
async function startServer() {
  try {
    // Create HTTP server
    const server = createServer(app);
    
    // Setup Vite or static files
    if (process.env.NODE_ENV === 'production') {
      serveStatic(app);
    } else {
      await setupVite(app, server);
    }

    // Start server
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 SkifyMagicAI Server running at:`);
      console.log(`   Local:   http://localhost:${PORT}`);
      console.log(`   Network: http://0.0.0.0:${PORT}`);
      console.log(`   Mode:    ${process.env.NODE_ENV || 'development'}\n`);
    });

    // Graceful shutdown
    const shutdownHandler = async () => {
      console.log('Shutting down gracefully...');
      server.close(() => {
        console.log('HTTP server closed');
        queueService.close().then(() => {
          console.log('Queue service closed');
          process.exit(0);
        });
      });
    };

    process.on('SIGTERM', shutdownHandler);
    process.on('SIGINT', shutdownHandler);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();