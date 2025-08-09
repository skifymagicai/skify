import express from 'express';
import cors from 'cors';
import { createServer } from 'http';

const app = express();
const PORT = parseInt(process.env.PORT || '5000');

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Skify AI Video Transform API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mock API endpoints for demonstration
app.get('/api/templates', (req, res) => {
  res.json({
    success: true,
    data: {
      templates: [
        {
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
        },
        {
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
        }
      ],
      pagination: {
        page: 1,
        limit: 12,
        total: 2
      }
    }
  });
});

// Mock viral transform endpoint
app.post('/api/viral/extract-style', (req, res) => {
  const jobId = `job-${Date.now()}`;
  
  res.json({
    success: true,
    data: {
      jobId,
      status: 'processing',
      message: 'Viral style extraction started'
    }
  });
});

app.get('/api/viral/job/:jobId/status', (req, res) => {
  const { jobId } = req.params;
  
  res.json({
    success: true,
    data: {
      jobId,
      status: 'completed',
      progress: 100,
      result: {
        videoUrl: '/api/placeholder/video-result.mp4',
        downloadUrl: `/api/download/${jobId}`,
        metadata: {
          duration: '0:15',
          aspectRatio: '9:16',
          fileSize: '2.4 MB',
          effects: 5,
          textOverlays: 3
        }
      }
    }
  });
});

// Serve static files and frontend
app.use(express.static('dist', { index: false }));

// SPA fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, error: 'API endpoint not found' });
  }
  
  // Serve index.html for all non-API routes
  res.sendFile('index.html', { root: 'dist' });
});

// Start server
const server = createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Skify server running on http://0.0.0.0:${PORT}`);
  console.log(`📱 Mobile PWA: http://0.0.0.0:${PORT}/mobile`);
  console.log(`💻 Desktop: http://0.0.0.0:${PORT}/desktop`);
  console.log(`🎯 Ready for viral video transformation!`);
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