import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { 
  insertUserSchema, 
  insertVideoSchema, 
  insertTemplateSchema, 
  insertPaymentSchema,
  insertAnalysisResultSchema 
} from "@shared/schema";

// Configure multer for video uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware (simplified for this implementation)
  const authenticateUser = async (req: any, res: any, next: any) => {
    const userId = req.headers['x-user-id']; // Simplified auth
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.userId = userId;
    next();
  };

  // ===== USER MANAGEMENT =====
  
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json({ user: { id: user.id, username: user.username, email: user.email } });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) { // In production, use proper password hashing
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      res.json({ 
        user: { id: user.id, username: user.username, email: user.email },
        token: 'jwt_token_here' // In production, generate proper JWT
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ===== NEW UPLOAD PIPELINE ROUTES =====
  
  // Import ES modules for upload pipeline
  const uploadRouter = (await import('./routes/upload.mjs')).default;
  const templateRouter = (await import('./routes/template.mjs')).default;
  const jobRouter = (await import('./routes/job.mjs')).default;
  
  app.use('/api/upload', uploadRouter);
  app.use('/api/template', templateRouter);
  app.use('/api/job', jobRouter);

  // ===== SKIFY AI VIDEO ANALYSIS ROUTES =====
  
  // Import video from URL with proper user validation
  app.post('/api/skify/import', authenticateUser, async (req: any, res) => {
    try {
      const { url, title } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: 'Video URL is required' });
      }

      const videoId = `import_${Date.now()}`;
      const videoData = {
        id: videoId,
        userId: req.userId,
        title: title || 'Imported Video',
        originalUrl: url,
        status: 'importing'
      };

      const video = await storage.createVideo(videoData);
      
      res.json({
        success: true,
        video,
        message: 'Video import started'
      });

    } catch (error: any) {
      console.error('Import error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Start AI analysis
  app.post('/api/skify/analyze', async (req: any, res) => {
    try {
      const { videoId, videoUrl, options } = req.body;
      const userId = req.headers['x-user-id'] || 'demo-user-001';
      
      if (!videoId && !videoUrl) {
        return res.status(400).json({ error: 'Video ID or URL is required' });
      }

      let video;
      if (videoId) {
        video = await storage.getVideo(videoId);
        if (!video) {
          return res.status(404).json({ error: 'Video not found' });
        }
      }

      // Create analysis job
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const jobData = {
        id: jobId,
        videoId: videoId || `url_${Date.now()}`,
        userId: userId,
        jobType: 'analysis' as const,
        status: 'processing' as const,
        progress: 0,
        metadata: { 
          videoUrl: videoUrl || video?.originalUrl,
          options 
        }
      };

      await storage.createProcessingJob(jobData);
      
      res.json({
        success: true,
        jobId,
        message: 'AI analysis started',
        estimatedTime: '2-3 minutes'
      });

    } catch (error: any) {
      console.error('Analysis start error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get user videos
  app.get('/api/skify/videos', async (req: any, res) => {
    try {
      const userId = req.query.userId || req.headers['x-user-id'] || 'demo-user-001';
      const videos = await storage.getUserVideos(userId);
      
      res.json({
        success: true,
        videos
      });

    } catch (error: any) {
      console.error('Videos fetch error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get job status
  app.get('/api/skify/jobs/:jobId', async (req, res) => {
    try {
      const job = await storage.getProcessingJob(req.params.jobId);
      
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      res.json({
        success: true,
        job: {
          id: job.id,
          status: job.status,
          progress: job.progress,
          result: job.metadata,
          error: job.errorMessage
        }
      });

    } catch (error: any) {
      console.error('Job status error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get templates
  app.get('/api/skify/templates', async (req, res) => {
    try {
      const templates = await storage.getPublicTemplates();
      
      res.json({
        success: true,
        templates
      });

    } catch (error: any) {
      console.error('Templates fetch error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Skify health endpoint
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

  // Upload video with file
  app.post('/api/skify/upload', upload.single('video'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No video file provided' });
      }

      const userId = req.headers['x-user-id'] || 'demo-user-001';
      const videoId = `upload_${Date.now()}`;
      
      const videoData = {
        id: videoId,
        userId: userId,
        title: req.body.title || req.file.originalname,
        originalUrl: `/uploads/${req.file.filename}`,
        status: 'uploaded'
      };

      const video = await storage.createVideo(videoData);
      
      res.json({
        success: true,
        video,
        message: 'Video uploaded successfully'
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ===== COMPREHENSIVE AI VIDEO PIPELINE =====
  
  // STEP 1: Video Import (Upload or URL) with Real AI Analysis
  
  app.post('/api/videos/upload', authenticateUser, upload.single('video'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No video file provided' });
      }

      const videoData = {
        userId: req.userId,
        title: req.body.title || 'Untitled Video',
        originalUrl: `/uploads/${req.file.filename}`, // In production, use CDN URL
      };

      const video = await storage.createVideo(videoData);
      
      // Start AI analysis job
      const analysisJob = await storage.createProcessingJob({
        videoId: video.id,
        jobType: 'analysis',
        metadata: { filePath: req.file.path }
      });

      // Simulate AI analysis (in production, integrate with RunwayML, Gemini, etc.)
      setTimeout(async () => {
        try {
          const analysisResult = {
            videoId: video.id,
            effects: [
              { name: "Film Grain", confidence: 92, timestamp: "0:15-0:45" },
              { name: "Color Pop", confidence: 87, timestamp: "0:30-1:20" },
              { name: "Motion Blur", confidence: 95, timestamp: "1:05-1:30" }
            ],
            templates: [
              { style: "Cinematic", confidence: 89 },
              { style: "Urban", confidence: 76 }
            ],
            transitions: [
              { type: "Quick Cut", confidence: 94, timestamp: "0:45" },
              { type: "Fade", confidence: 88, timestamp: "1:15" }
            ],
            colorGrading: {
              lut: "Cinematic Blue",
              contrast: 1.2,
              saturation: 1.1,
              temperature: -200
            },
            cameraMotion: [
              { type: "Pan Left", confidence: 91, timestamp: "0:05-0:25" },
              { type: "Zoom In", confidence: 86, timestamp: "0:50-1:10" }
            ],
            aiEdits: [
              { type: "Auto Cut", confidence: 93, timestamp: "0:35" },
              { type: "Beat Sync", confidence: 89, timestamp: "1:00-1:25" }
            ],
            confidence: 90,
            processingTime: 15000
          };

          await storage.createAnalysisResult(analysisResult);
          await storage.updateJobProgress(analysisJob.id, 100, 'completed');
          
          // Use the updateVideo method instead of updateVideoStatus
          await storage.updateVideo(video.id, { status: 'analyzed' });
        } catch (error) {
          await storage.updateJobProgress(analysisJob.id, 0, 'failed');
          console.error('Analysis failed:', error);
        }
      }, 2000); // Simulate 2-second processing

      res.status(201).json({ 
        video, 
        analysisJobId: analysisJob.id,
        message: 'Video uploaded successfully. AI analysis started.' 
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/videos/:id/analysis', authenticateUser, async (req: any, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video || video.userId !== req.userId) {
        return res.status(404).json({ error: 'Video not found' });
      }

      const analysis = await storage.getAnalysisResult(video.id);
      if (!analysis) {
        return res.status(202).json({ message: 'Analysis in progress' });
      }

      res.json({ video, analysis });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/videos/user/:userId', authenticateUser, async (req: any, res) => {
    try {
      if (req.params.userId !== req.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const videos = await storage.getUserVideos(req.userId);
      res.json({ videos });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ===== TEMPLATE MANAGEMENT =====
  
  // STEP 2: Template Creation from Analysis Results
  
  app.post('/api/templates/create-from-analysis', authenticateUser, async (req: any, res) => {
    try {
      const { videoId, templateName, templateDescription } = req.body;
      
      if (!videoId || !templateName) {
        return res.status(400).json({ error: 'Video ID and template name are required' });
      }

      // Get video and analysis results
      const video = await storage.getVideo(videoId);
      if (!video || video.userId !== req.userId) {
        return res.status(404).json({ error: 'Video not found' });
      }

      const analysis = await storage.getAnalysisResult(videoId);
      if (!analysis) {
        return res.status(400).json({ error: 'Video analysis not found. Please analyze video first.' });
      }

      // Create reusable template from analysis
      const template = await storage.createTemplate({
        userId: req.userId,
        name: templateName,
        description: templateDescription || `Template extracted from ${video.title}`,
        colorPalette: analysis.colorGrading as any,
        effects: analysis.effects as any,
        transitions: analysis.transitions as any,
        colorGrading: analysis.colorGrading as any,
        cameraMotion: analysis.cameraMotion as any,
        audioUrl: video.audioUrl,
        audioFeatures: analysis.audioAnalysis as any,
        textElements: (analysis.textExtraction as any)?.extractedTexts || [],
        fontPalette: (analysis.textExtraction as any)?.detectedFonts || [],
        thumbnail: `/uploads/${videoId}/thumbnail.jpg`,
        isPublic: false
      });

      res.status(201).json({ 
        template,
        message: 'Template created successfully from video analysis',
        nextStep: 'Upload a new video to apply this template'
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/templates/create', authenticateUser, async (req: any, res) => {
    try {
      const templateData = insertTemplateSchema.parse({
        ...req.body,
        userId: req.userId
      });

      const template = await storage.createTemplate(templateData);
      res.status(201).json({ template });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/templates/public', async (req, res) => {
    try {
      const templates = await storage.getPublicTemplates();
      
      // Add analytics data for each template
      const templatesWithAnalytics = await Promise.all(
        templates.map(async (template) => {
          const analytics = await storage.getTemplateAnalytics(template.id);
          return {
            ...template,
            views: analytics?.views || 0,
            likes: analytics?.likes || 0,
            applications: analytics?.applications || 0,
            averageRating: analytics?.averageRating || 0,
            trendingScore: analytics?.trendingScore || 0
          };
        })
      );

      res.json({ templates: templatesWithAnalytics });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/templates/trending', async (req, res) => {
    try {
      const templates = await storage.getTrendingTemplates();
      res.json({ templates });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/templates/:id', async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      // Increment view count
      await storage.updateTemplateAnalytics({
        templateId: template.id,
        views: 1
      });

      const analytics = await storage.getTemplateAnalytics(template.id);
      res.json({ 
        template: {
          ...template,
          views: analytics?.views || 0,
          likes: analytics?.likes || 0,
          applications: analytics?.applications || 0
        }
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/templates/:id/like', authenticateUser, async (req: any, res) => {
    try {
      const templateId = req.params.id;
      const template = await storage.getTemplate(templateId);
      
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      const isLiked = await storage.isTemplateLiked(req.userId, templateId);
      
      if (isLiked) {
        await storage.unlikeTemplate(req.userId, templateId);
        await storage.updateTemplateAnalytics({
          templateId,
          likes: -1
        });
        res.json({ liked: false, message: 'Template unliked' });
      } else {
        await storage.likeTemplate(req.userId, templateId);
        await storage.updateTemplateAnalytics({
          templateId,
          likes: 1
        });
        res.json({ liked: true, message: 'Template liked' });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ===== VIDEO STYLE APPLICATION WITH AUDIO MATCHING =====
  
  // STEP 3: Apply Template to User Video (Complete Transformation)
  
  app.post('/api/templates/:id/apply-to-video', authenticateUser, upload.single('userVideo'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'User video file is required' });
      }

      const templateId = req.params.id;
      const { applyVisual, applyAudio, applyText, videoTitle } = req.body;
      
      // Get template
      const template = await storage.getTemplate(templateId);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      // Create new video record for the transformation
      const userVideo = await storage.createVideo({
        userId: req.userId,
        title: videoTitle || `Styled with ${template.name}`,
        originalUrl: `/uploads/${req.file.filename}`,
        templateId: template.id,
        status: 'processing'
      });

      // Start template application job
      const applicationJob = await storage.createProcessingJob({
        videoId: userVideo.id,
        jobType: 'template_application',
        metadata: {
          templateId: template.id,
          userVideoPath: req.file.path,
          options: {
            applyVisual: applyVisual === 'true',
            applyAudio: applyAudio === 'true', 
            applyText: applyText === 'true'
          }
        }
      });

      // Start real template application process
      setTimeout(async () => {
        try {
          const { aiVideoProcessor } = await import('./ai-services');
          
          await storage.updateJobProgress(applicationJob.id, 20, 'processing');
          
          // Apply template to user video
          const styledVideoPath = await aiVideoProcessor.applyTemplate(
            req.file.path,
            template,
            {
              applyVisual: applyVisual === 'true',
              applyAudio: applyAudio === 'true',
              applyText: applyText === 'true'
            }
          );

          await storage.updateJobProgress(applicationJob.id, 90, 'processing');

          // Update video with styled version
          await storage.updateVideo(userVideo.id, {
            status: 'completed',
            styledUrl: styledVideoPath,
            audioMatched: applyAudio === 'true'
          });

          await storage.updateJobProgress(applicationJob.id, 100, 'completed');

        } catch (error: any) {
          await storage.updateJobProgress(applicationJob.id, 0, 'failed');
          console.error('Template application failed:', error);
        }
      }, 3000);

      res.status(201).json({
        userVideo,
        applicationJobId: applicationJob.id,
        template: {
          id: template.id,
          name: template.name,
          description: template.description
        },
        message: 'Template application started',
        nextStep: 'Monitor progress, then preview and export styled video'
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/videos/:id/apply-template', authenticateUser, async (req: any, res) => {
    try {
      const { templateId, includeAudio = false } = req.body;
      const video = await storage.getVideo(req.params.id);
      const template = await storage.getTemplate(templateId);

      if (!video || video.userId !== req.userId) {
        return res.status(404).json({ error: 'Video not found' });
      }

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      // Start template application job
      const applicationJob = await storage.createProcessingJob({
        videoId: video.id,
        jobType: includeAudio ? 'template_application_with_audio' : 'template_application',
        metadata: { templateId, originalUrl: video.originalUrl, includeAudio }
      });

      // Simulate template application processing
      setTimeout(async () => {
        try {
          const styledUrl = `/styled/${video.id}_${templateId}.mp4`;
          let audioMatchedUrl = null;
          
          // If audio matching is requested and template has audio
          if (includeAudio && template.audioUrl) {
            // In production, use AI services to synchronize audio
            audioMatchedUrl = `/styled/${video.id}_${templateId}_audio_matched.mp4`;
            await storage.updateVideoAudioMatched(video.id, true);
          }
          
          await storage.updateVideoStatus(video.id, 'styled', audioMatchedUrl || styledUrl);
          await storage.incrementTemplateUsage(templateId);
          await storage.updateTemplateAnalytics({
            templateId,
            applications: 1
          });
          await storage.updateJobProgress(applicationJob.id, 100, 'completed');
        } catch (error) {
          await storage.updateJobProgress(applicationJob.id, 0, 'failed');
          console.error('Template application failed:', error);
        }
      }, includeAudio ? 8000 : 5000); // Audio matching takes longer

      res.json({ 
        message: includeAudio ? 'Template and audio matching started' : 'Template application started', 
        jobId: applicationJob.id,
        estimatedTime: includeAudio ? '8-12 seconds' : '5-10 seconds',
        audioMatching: includeAudio
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ===== AUDIO EXTRACTION AND MATCHING =====
  
  app.post('/api/videos/:id/extract-audio', authenticateUser, async (req: any, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video || video.userId !== req.userId) {
        return res.status(404).json({ error: 'Video not found' });
      }

      // Start audio extraction job
      const extractionJob = await storage.createProcessingJob({
        videoId: video.id,
        jobType: 'audio_extraction',
        metadata: { originalUrl: video.originalUrl }
      });

      // Simulate audio extraction processing
      setTimeout(async () => {
        try {
          const audioUrl = `/uploads/audio/${video.id}_extracted.mp3`;
          await storage.updateVideoAudio(video.id, audioUrl);
          await storage.updateJobProgress(extractionJob.id, 100, 'completed');
        } catch (error) {
          await storage.updateJobProgress(extractionJob.id, 0, 'failed');
          console.error('Audio extraction failed:', error);
        }
      }, 3000); // Simulate 3-second extraction

      res.json({ 
        message: 'Audio extraction started', 
        jobId: extractionJob.id,
        estimatedTime: '3-5 seconds'
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/videos/:id/sync-audio', authenticateUser, async (req: any, res) => {
    try {
      const { sourceVideoId } = req.body;
      const targetVideo = await storage.getVideo(req.params.id);
      const sourceVideo = await storage.getVideo(sourceVideoId);

      if (!targetVideo || targetVideo.userId !== req.userId) {
        return res.status(404).json({ error: 'Target video not found' });
      }

      if (!sourceVideo || !sourceVideo.audioUrl) {
        return res.status(404).json({ error: 'Source video or audio not found' });
      }

      // Start audio synchronization job
      const syncJob = await storage.createProcessingJob({
        videoId: targetVideo.id,
        jobType: 'audio_synchronization',
        metadata: { 
          targetVideoUrl: targetVideo.originalUrl,
          sourceAudioUrl: sourceVideo.audioUrl,
          targetDuration: targetVideo.duration 
        }
      });

      // Simulate audio synchronization processing
      setTimeout(async () => {
        try {
          const syncedUrl = `/uploads/synced/${targetVideo.id}_audio_synced.mp4`;
          await storage.updateVideoStatus(targetVideo.id, 'audio_synced', syncedUrl);
          await storage.updateVideoAudioMatched(targetVideo.id, true);
          await storage.updateJobProgress(syncJob.id, 100, 'completed');
        } catch (error) {
          await storage.updateJobProgress(syncJob.id, 0, 'failed');
          console.error('Audio synchronization failed:', error);
        }
      }, 6000); // Simulate 6-second sync processing

      res.json({ 
        message: 'Audio synchronization started', 
        jobId: syncJob.id,
        estimatedTime: '6-10 seconds'
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ===== VIDEO LINK FETCHING & DOWNLOADING =====

  app.post('/api/videos/fetch-from-url', authenticateUser, async (req: any, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: 'Video URL is required' });
      }

      // Import video downloader dynamically
      const { videoDownloader } = await import('./video-downloader');
      
      // Start video download job
      const downloadJob = await storage.createProcessingJob({
        videoId: 'pending', // Will be updated once video is created
        jobType: 'video_download',
        metadata: { 
          sourceUrl: url,
          platform: getPlatformFromUrl(url)
        }
      });

      // Start download process in background
      setTimeout(async () => {
        try {
          const downloadResult = await videoDownloader.downloadVideo(url);
          
          if (downloadResult.success && downloadResult.videoPath) {
            // Create video record
            const video = await storage.createVideo({
              userId: req.userId,
              title: downloadResult.title || 'Downloaded Video',
              originalUrl: downloadResult.videoUrl,
              status: 'downloaded',
              duration: downloadResult.duration || 0
            });

            // Update job with video ID
            await storage.updateJobProgress(downloadJob.id, 100, 'completed');
            await storage.updateProcessingJobMetadata(downloadJob.id, { 
              videoId: video.id,
              downloadPath: downloadResult.videoPath
            });

          } else {
            await storage.updateJobProgress(downloadJob.id, 0, 'failed');
            await storage.updateProcessingJobError(downloadJob.id, downloadResult.error || 'Download failed');
          }
        } catch (error: any) {
          await storage.updateJobProgress(downloadJob.id, 0, 'failed');
          await storage.updateProcessingJobError(downloadJob.id, error.message);
          console.error('Video download failed:', error);
        }
      }, 2000); // Start download after 2 seconds

      res.json({ 
        message: 'Video download started', 
        jobId: downloadJob.id,
        estimatedTime: '10-30 seconds'
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Helper function to detect platform from URL
  function getPlatformFromUrl(url: string): string {
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('tiktok.com')) return 'TikTok'; 
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    return 'Unknown';
  }

  // ===== TEXT EXTRACTION & LYRICAL ANALYSIS =====

  app.post('/api/videos/:id/extract-text', authenticateUser, async (req: any, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video || video.userId !== req.userId) {
        return res.status(404).json({ error: 'Video not found' });
      }

      // Start text extraction job
      const extractionJob = await storage.createProcessingJob({
        videoId: video.id,
        jobType: 'text_extraction',
        metadata: { videoUrl: video.originalUrl }
      });

      // Simulate OCR text extraction processing
      setTimeout(async () => {
        try {
          const textResults = {
            extractedTexts: [
              {
                id: "text-1",
                text: "When the beat drops",
                startTime: 15.5,
                endTime: 18.2,
                position: { x: 50, y: 200, width: 300, height: 60 },
                fontFamily: "Montserrat",
                fontSize: 42,
                fontWeight: "bold",
                color: "#FFFFFF",
                backgroundColor: "rgba(0,0,0,0.5)",
                animation: "fade",
                confidence: 94
              },
              {
                id: "text-2", 
                text: "Feel the rhythm",
                startTime: 18.5,
                endTime: 21.0,
                position: { x: 75, y: 350, width: 250, height: 50 },
                fontFamily: "Montserrat",
                fontSize: 36,
                fontWeight: "regular",
                color: "#FFD700",
                animation: "slide",
                confidence: 89
              }
            ],
            detectedFonts: [
              {
                family: "Montserrat",
                weight: "bold",
                style: "normal",
                usage: "primary",
                confidence: 92
              }
            ]
          };

          const lyricalData = {
            hasLyrics: true,
            language: "en",
            totalTextElements: 12,
            primaryFont: {
              family: "Montserrat",
              size: 42,
              color: "#FFFFFF"
            },
            textCategory: "lyrics"
          };

          // Store analysis results
          await storage.updateAnalysisResults(video.id, {
            textExtraction: textResults,
            lyricalData: lyricalData
          });

          await storage.updateJobProgress(extractionJob.id, 100, 'completed');
        } catch (error) {
          await storage.updateJobProgress(extractionJob.id, 0, 'failed');
          console.error('Text extraction failed:', error);
        }
      }, 4000); // Simulate 4-second OCR processing

      res.json({ 
        message: 'Text extraction started', 
        jobId: extractionJob.id,
        estimatedTime: '4-6 seconds'
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/videos/:id/apply-lyrical-template', authenticateUser, async (req: any, res) => {
    try {
      const { templateId, customLyrics, preserveOriginalText } = req.body;
      const video = await storage.getVideo(req.params.id);
      
      if (!video || video.userId !== req.userId) {
        return res.status(404).json({ error: 'Video not found' });
      }

      const template = await storage.getTemplate(templateId);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      // Start lyrical template application job
      const applicationJob = await storage.createProcessingJob({
        videoId: video.id,
        jobType: 'lyrical_application',
        metadata: { 
          templateId,
          customLyrics,
          preserveOriginalText,
          videoUrl: video.originalUrl
        }
      });

      // Simulate lyrical template application processing
      setTimeout(async () => {
        try {
          const processedUrl = `/uploads/lyrical/${video.id}_lyrical_applied.mp4`;
          await storage.updateVideoStatus(video.id, 'lyrical_applied', processedUrl);
          await storage.updateJobProgress(applicationJob.id, 100, 'completed');
        } catch (error) {
          await storage.updateJobProgress(applicationJob.id, 0, 'failed');
          console.error('Lyrical template application failed:', error);
        }
      }, 8000); // Simulate 8-second processing

      res.json({ 
        message: 'Lyrical template application started', 
        jobId: applicationJob.id,
        estimatedTime: '8-12 seconds'
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // STEP 4: Export/Download Styled Video with Watermark Control

  app.post('/api/videos/:id/export', authenticateUser, async (req: any, res) => {
    try {
      const videoId = req.params.id;
      const { removeWatermark } = req.body;

      const video = await storage.getVideo(videoId);
      if (!video || video.userId !== req.userId) {
        return res.status(404).json({ error: 'Video not found' });
      }

      if (video.status !== 'completed') {
        return res.status(400).json({ 
          error: 'Video processing not completed yet',
          currentStatus: video.status,
          message: 'Please wait for template application to finish'
        });
      }

      // Check for watermark removal payment
      if (removeWatermark) {
        const payments = await storage.getUserPayments(req.userId);
        const hasWatermarkRemoval = payments.some(p => 
          p.type === 'watermark_removal' && p.status === 'completed'
        );
        
        if (!hasWatermarkRemoval) {
          return res.status(402).json({ 
            error: 'Payment required for watermark removal',
            paymentRequired: true,
            amount: 4900, // ₹49 in paise
            type: 'watermark_removal',
            message: 'Upgrade to remove watermark and unlock premium export'
          });
        }
      }

      // Generate final export URL
      const exportUrl = removeWatermark 
        ? video.styledUrl  // Clean version
        : `${video.styledUrl}?watermark=true`; // With watermark

      res.json({
        exportUrl,
        videoId: video.id,
        title: video.title,
        watermarkFree: removeWatermark,
        downloadReady: true,
        exportFormat: 'MP4',
        quality: 'HD 1080p',
        fileSize: '~25MB',
        message: 'Video ready for download'
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== PAYMENT PROCESSING =====
  
  app.post('/api/payments/create', authenticateUser, async (req: any, res) => {
    try {
      const { videoId, type } = req.body;
      
      const amounts = {
        watermark_removal: 4900, // ₹49 in paise
        pro_subscription: 19900   // ₹199 in paise
      };

      const paymentData = {
        userId: req.userId,
        videoId: videoId || null,
        amount: amounts[type as keyof typeof amounts],
        type
      };

      const payment = await storage.createPayment(paymentData);
      
      // In production, integrate with Razorpay API
      const razorpayOrder = {
        id: `order_${Date.now()}`,
        amount: payment.amount,
        currency: 'INR',
        status: 'created'
      };

      res.json({ 
        payment,
        razorpayOrder,
        message: 'Payment created successfully'
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/payments/:id/verify', authenticateUser, async (req: any, res) => {
    try {
      const { razorpayPaymentId, razorpaySignature } = req.body;
      const payment = await storage.getPayment(req.params.id);

      if (!payment || payment.userId !== req.userId) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      // In production, verify payment with Razorpay
      const isVerified = true; // Simulate successful verification

      if (isVerified) {
        await storage.updatePaymentStatus(payment.id, 'completed', razorpayPaymentId);
        
        if (payment.type === 'pro_subscription') {
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription
          
          await storage.createSubscription({
            userId: payment.userId,
            plan: 'pro',
            endDate,
            paymentId: payment.id
          });
        }

        res.json({ message: 'Payment verified successfully', payment });
      } else {
        await storage.updatePaymentStatus(payment.id, 'failed');
        res.status(400).json({ error: 'Payment verification failed' });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ===== JOB STATUS TRACKING =====
  
  app.get('/api/jobs/:id/status', authenticateUser, async (req: any, res) => {
    try {
      const job = await storage.getProcessingJob(req.params.id);
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      res.json({ job });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ===== ANALYTICS AND ADMIN =====
  
  app.get('/api/analytics/dashboard', authenticateUser, async (req: any, res) => {
    try {
      // In production, check if user is admin
      const userVideos = await storage.getUserVideos(req.userId);
      const userSubscription = await storage.getUserSubscription(req.userId);
      
      res.json({
        totalVideos: userVideos.length,
        processedVideos: userVideos.filter(v => v.status === 'styled').length,
        subscription: userSubscription,
        recentVideos: userVideos.slice(0, 5)
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
