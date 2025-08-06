import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { aiProcessor } from './ai-processor.js';
import { storage } from './storage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/temp', express.static(path.join(__dirname, '../temp')));

// Configure multer for video uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
  fileFilter: (req, file, cb) => {
    console.log('File upload attempt:', { 
      filename: file.originalname, 
      mimetype: file.mimetype,
      fieldname: file.fieldname 
    });
    
    if (file.mimetype.startsWith('video/') || file.originalname.endsWith('.mp4')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  }
});

// Job tracking in memory (in production, use Redis)
const jobs = new Map();

function createJob(type, data) {
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const job = {
    id: jobId,
    type,
    status: 'queued',
    progress: 0,
    data,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  jobs.set(jobId, job);
  return job;
}

function updateJob(jobId, updates) {
  const job = jobs.get(jobId);
  if (job) {
    Object.assign(job, updates, { updatedAt: new Date() });
    jobs.set(jobId, job);
  }
  return job;
}

// ===== API ROUTES =====

// Health check (both paths for compatibility)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      replicate: !!process.env.REPLICATE_API_KEY,
      assemblyai: !!process.env.ASSEMBLYAI_API_KEY,
      cloudinary: !!process.env.CLOUDINARY_CLOUD,
      googleVision: !!process.env.GOOGLE_APPLICATION_CREDENTIALS
    }
  });
});

app.get('/api/skify/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      replicate: !!process.env.REPLICATE_API_KEY,
      assemblyai: !!process.env.ASSEMBLYAI_API_KEY,
      cloudinary: !!process.env.CLOUDINARY_CLOUD,
      googleVision: !!process.env.GOOGLE_APPLICATION_CREDENTIALS
    }
  });
});

// 1. VIDEO UPLOAD - Upload user video for processing
app.post('/api/skify/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    const { userId, title } = req.body;
    const videoId = `upload_${Date.now()}`;

    // Ensure valid user ID for database constraint
    const validUserId = userId || req.headers['x-user-id'] || 'demo-user-001';
    
    // Save video metadata
    const video = await storage.saveVideo({
      id: videoId,
      userId: validUserId,
      title: title || 'Uploaded Video',
      originalPath: req.file.path,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      status: 'uploaded',
      // Add full server path for analysis
      fullPath: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
    });

    console.log('Video uploaded:', { 
      id: video.id, 
      path: video.originalPath,
      fullPath: video.fullPath 
    });

    res.json({
      success: true,
      video,
      message: 'Video uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. VIDEO IMPORT - Import video from URL  
app.post('/api/skify/import', async (req, res) => {
  try {
    const { url, userId, title } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'Video URL is required' });
    }

    const videoId = `import_${Date.now()}`;
    
    // Ensure valid user ID for database constraint
    const validUserId = userId || req.headers['x-user-id'] || 'demo-user-001';
    
    // Save video metadata
    const video = await storage.saveVideo({
      id: videoId,
      userId: validUserId,
      title: title || 'Imported Video',
      originalUrl: url,
      status: 'importing'
    });

    res.json({
      success: true,
      video,
      message: 'Video import started'
    });

  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. AI ANALYSIS - Analyze video for style extraction
app.post('/api/skify/analyze', async (req, res) => {
  try {
    const { videoId, videoUrl, options } = req.body;
    console.log('AI Analysis request:', { videoId, videoUrl, options });

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    const video = await storage.getVideo(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    console.log('Video found:', { 
      id: video.id, 
      originalPath: video.originalPath, 
      originalUrl: video.originalUrl 
    });

    // Create analysis job
    const job = createJob('analysis', { videoId, options });

    // Start async analysis
    setImmediate(async () => {
      try {
        updateJob(job.id, { status: 'processing', progress: 10 });

        // Use provided URL, original URL, or file path
        const videoSource = videoUrl || video.originalUrl || video.originalPath;
        console.log('Using video source:', videoSource);
        
        updateJob(job.id, { status: 'analyzing', progress: 30 });
        
        // Run AI analysis
        const analysisResult = await aiProcessor.processVideo(videoSource, options);
        
        updateJob(job.id, { status: 'saving', progress: 80 });
        
        // Save analysis results
        await storage.saveAnalysis({
          videoId,
          ...analysisResult
        });

        // Update video status
        await storage.updateVideo(videoId, { 
          status: 'analyzed',
          cloudinaryUrl: analysisResult.cloudinaryUrl,
          analysisComplete: true
        });

        updateJob(job.id, { 
          status: 'completed', 
          progress: 100,
          result: analysisResult
        });

      } catch (error) {
        console.error('Analysis job error:', error);
        updateJob(job.id, { 
          status: 'failed', 
          error: error.message 
        });
        
        await storage.updateVideo(videoId, { status: 'failed' });
      }
    });

    res.json({
      success: true,
      jobId: job.id,
      message: 'AI analysis started',
      estimatedTime: '2-3 minutes'
    });

  } catch (error) {
    console.error('Analysis start error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. JOB STATUS - Check analysis progress
app.get('/api/skify/jobs/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);
  
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json({
    success: true,
    job: {
      id: job.id,
      type: job.type,
      status: job.status,
      progress: job.progress,
      error: job.error,
      result: job.result,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    }
  });
});

// 5. SAVE TEMPLATE - Save analysis as reusable template
app.post('/api/skify/templates', async (req, res) => {
  try {
    const { videoId, name, description, isPublic } = req.body;

    if (!videoId || !name) {
      return res.status(400).json({ error: 'Video ID and name are required' });
    }

    const analysis = await storage.getAnalysis(videoId);
    if (!analysis) {
      return res.status(404).json({ error: 'Video analysis not found' });
    }

    const template = await storage.saveTemplate({
      id: `template_${Date.now()}`,
      name,
      description,
      videoId,
      styleAnalysis: analysis.styleAnalysis,
      isPublic: isPublic || false,
      createdAt: new Date()
    });

    res.json({
      success: true,
      template,
      message: 'Template saved successfully'
    });

  } catch (error) {
    console.error('Template save error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 6. GET TEMPLATES - List available templates
app.get('/api/skify/templates', async (req, res) => {
  try {
    const { userId, isPublic } = req.query;
    const templates = await storage.getTemplates({ userId, isPublic });

    res.json({
      success: true,
      templates
    });

  } catch (error) {
    console.error('Template fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 7. APPLY STYLE - Apply template style to user video
app.post('/api/apply-style', async (req, res) => {
  try {
    const { userVideoId, templateId } = req.body;

    if (!userVideoId || !templateId) {
      return res.status(400).json({ error: 'User video ID and template ID are required' });
    }

    const userVideo = await storage.getVideo(userVideoId);
    const template = await storage.getTemplate(templateId);

    if (!userVideo || !template) {
      return res.status(404).json({ error: 'Video or template not found' });
    }

    // Create styling job
    const job = createJob('styling', { userVideoId, templateId });

    // Start async styling
    setImmediate(async () => {
      try {
        updateJob(job.id, { status: 'processing', progress: 20 });

        const videoSource = userVideo.originalUrl || userVideo.originalPath;
        const outputVideoId = `styled_${Date.now()}`;

        updateJob(job.id, { status: 'applying_style', progress: 50 });

        // Apply style using AI processor
        const styledResult = await aiProcessor.applyStyleToVideo(
          videoSource,
          template.styleAnalysis,
          outputVideoId
        );

        updateJob(job.id, { status: 'finalizing', progress: 90 });

        // Save styled video
        await storage.saveStyledVideo({
          id: outputVideoId,
          userId: userVideo.userId,
          originalVideoId: userVideoId,
          templateId,
          styledVideoUrl: styledResult.styledVideoUrl,
          cloudinaryId: styledResult.publicId,
          appliedStyle: styledResult.appliedStyle
        });

        updateJob(job.id, { 
          status: 'completed', 
          progress: 100,
          result: {
            styledVideoId: outputVideoId,
            styledVideoUrl: styledResult.styledVideoUrl
          }
        });

      } catch (error) {
        console.error('Styling job error:', error);
        updateJob(job.id, { 
          status: 'failed', 
          error: error.message 
        });
      }
    });

    res.json({
      success: true,
      jobId: job.id,
      message: 'Style application started',
      estimatedTime: '3-5 minutes'
    });

  } catch (error) {
    console.error('Style application error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 8. GET ANALYSIS - Get detailed analysis results
app.get('/api/skify/analysis/:videoId', async (req, res) => {
  try {
    const analysis = await storage.getAnalysis(req.params.videoId);
    
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Analysis fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 9. GET VIDEOS - List user videos
app.get('/api/skify/videos', async (req, res) => {
  try {
    const { userId } = req.query;
    const videos = await storage.getUserVideos(userId || 'anonymous');

    res.json({
      success: true,
      videos
    });

  } catch (error) {
    console.error('Videos fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 10. DOWNLOAD - Download processed video
app.get('/api/download/:videoId', async (req, res) => {
  try {
    const video = await storage.getStyledVideo(req.params.videoId);
    
    if (!video) {
      return res.status(404).json({ error: 'Styled video not found' });
    }

    // Return Cloudinary URL for download
    res.json({
      success: true,
      downloadUrl: video.styledVideoUrl,
      video
    });

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// Don't start server here - export app for mounting
console.log('Skify AI module loaded successfully');
console.log('AI Services initialized:');
console.log('- Replicate:', !!process.env.REPLICATE_API_KEY);
console.log('- AssemblyAI:', !!process.env.ASSEMBLYAI_API_KEY);
console.log('- Cloudinary:', !!process.env.CLOUDINARY_CLOUD);
console.log('- Google Vision:', !!process.env.GOOGLE_APPLICATION_CREDENTIALS);

export default app;