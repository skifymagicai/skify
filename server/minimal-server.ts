import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { setupVite } from './vite.js';

const app = express();
const PORT = parseInt(process.env.PORT || '5000');

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

// Basic API routes for testing
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'SkifyMagicAI API endpoint working',
    timestamp: new Date().toISOString()
  });
});

// Mock user profile endpoint
app.get('/api/user/profile', (req, res) => {
  res.json({
    success: true,
    data: {
      id: 'demo-user',
      username: 'demo',
      email: 'demo@skify.ai',
      tier: 'free',
      uploadLimit: 5,
      uploadsUsed: 0
    }
  });
});

// Mock templates endpoint
app.get('/api/templates', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'template-1',
        name: 'Viral Dance Style',
        description: 'Extract dance moves and transitions',
        thumbnailUrl: '/api/placeholder/300x200',
        tags: ['dance', 'viral', 'transitions'],
        likes: 1250,
        uses: 850
      },
      {
        id: 'template-2', 
        name: 'Text Overlay Magic',
        description: 'Animated text with perfect timing',
        thumbnailUrl: '/api/placeholder/300x200',
        tags: ['text', 'overlay', 'animation'],
        likes: 980,
        uses: 620
      }
    ]
  });
});

// Placeholder image endpoint
app.get('/api/placeholder/:dimensions', (req, res) => {
  const { dimensions } = req.params;
  const svg = `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#1a1a1a"/>
    <text x="50%" y="50%" text-anchor="middle" fill="white" font-size="16">
      ${dimensions} Placeholder
    </text>
  </svg>`;
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
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
    
    // Setup Vite for development
    if (process.env.NODE_ENV !== 'production') {
      await setupVite(app, server);
    }

    // Start server
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 SkifyMagicAI Minimal Server running at:`);
      console.log(`   Local:   http://localhost:${PORT}`);
      console.log(`   Network: http://0.0.0.0:${PORT}`);
      console.log(`   Mode:    ${process.env.NODE_ENV || 'development'}`);
      console.log(`\n✨ Frontend and API are ready!\n`);
    });

    // Graceful shutdown
    const shutdownHandler = async () => {
      console.log('Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
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