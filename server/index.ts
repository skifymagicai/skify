import express from 'express';
import cors from 'cors';
import { setupVite, serveStatic } from './vite.js';
import { createServer } from 'http';

// Import routes
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import templateRoutes from './routes/templates.js';
import jobRoutes from './routes/jobs.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';

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
app.use('/api/job', jobRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

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