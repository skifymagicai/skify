import type { Express } from "express";
import multer from "multer";
import { viralAnalyzer } from "./viral-analyzer";
import { templateStorage } from "./template-storage";
import { storage } from "./storage";
import path from 'path';

// Configure multer for viral video uploads
const viralUpload = multer({
  dest: 'uploads/viral/',
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

export function registerViralRoutes(app: Express) {
  // Authentication middleware (simplified)
  const authenticateUser = async (req: any, res: any, next: any) => {
    const userId = req.headers['x-user-id'] || 'user_001'; // Simplified auth
    req.userId = userId;
    next();
  };

  // ===== VIRAL ANALYSIS & TEMPLATE CREATION =====

  /**
   * Step 1: Upload viral video for analysis and template creation
   */
  app.post('/api/videos/analyze-viral', viralUpload.single('viralVideo'), authenticateUser, async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No viral video file uploaded' });
      }

      const { title } = req.body;
      const viralVideoPath = req.file.path;
      const templateName = title || req.file.originalname;

      console.log(`Starting viral analysis for: ${templateName}`);

      // Start analysis and template creation process
      const analysisResult = await viralAnalyzer.analyzeViralVideo(viralVideoPath, templateName);

      // Create video record in database
      const videoData = {
        userId: req.userId,
        title: templateName,
        originalUrl: viralVideoPath,
        templateId: analysisResult.templateId,
        status: 'analyzed' as const,
        duration: 0, // Will be updated after analysis
        audioMatched: false
      };

      const video = await storage.createVideo(videoData);

      // Create processing job record
      const jobData = {
        videoId: video.id,
        jobType: 'viral_analysis' as const,
        status: 'completed' as const,
        progress: 100,
        metadata: {
          templateId: analysisResult.templateId,
          folderPath: analysisResult.folderPath,
          assets: analysisResult.assets
        }
      };

      const job = await storage.createProcessingJob(jobData);

      res.status(201).json({
        success: true,
        message: 'Viral video analyzed and template created successfully',
        video,
        template: {
          id: analysisResult.templateId,
          name: templateName,
          folderPath: analysisResult.folderPath,
          assets: analysisResult.assets
        },
        jobId: job.id,
        nextStep: 'Upload your own video to apply this viral template'
      });

    } catch (error: any) {
      console.error('Viral analysis error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Step 1b: Import viral video from URL for analysis
   */
  app.post('/api/videos/analyze-viral-url', authenticateUser, async (req: any, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: 'Video URL is required' });
      }

      // Extract video title from URL
      const templateName = `Viral Video ${Date.now()}`;

      console.log(`Starting viral URL analysis for: ${url}`);

      // In production, download video first using ytdl-core or similar
      // For now, simulate the process
      
      // Create a temporary video record
      const videoData = {
        userId: req.userId,
        title: templateName,
        originalUrl: url,
        status: 'processing' as const,
        duration: 0,
        audioMatched: false
      };

      const video = await storage.createVideo(videoData);

      // Create processing job
      const jobData = {
        videoId: video.id,
        jobType: 'viral_url_analysis' as const,
        status: 'processing' as const,
        progress: 0,
        metadata: { originalUrl: url }
      };

      const job = await storage.createProcessingJob(jobData);

      // Start background processing
      setTimeout(async () => {
        try {
          // Simulate analysis completion
          const mockAnalysisResult = {
            templateId: `viral_url_${Date.now()}`,
            folderPath: `templates/viral_url_${Date.now()}/`,
            assets: {
              visual: { effects: ['color_boost'], transitions: ['quick_cut'] },
              audio: { tempo: 128, energy: 0.8 },
              text: { fonts: ['Arial Bold'], colors: ['#FFFFFF'] }
            }
          };

          // Update job status
          await storage.updateJobProgress(job.id, 100, 'completed');
          await storage.updateProcessingJobMetadata(job.id, mockAnalysisResult);

          // Update video record
          await storage.updateVideo(video.id, {
            templateId: mockAnalysisResult.templateId,
            status: 'analyzed'
          });

        } catch (bgError) {
          console.error('Background processing error:', bgError);
          await storage.updateJobProgress(job.id, 0, 'failed');
          await storage.updateProcessingJobError(job.id, bgError.message);
        }
      }, 3000); // Simulate 3 second processing

      res.status(202).json({
        success: true,
        message: 'Viral video URL import started',
        video,
        jobId: job.id,
        status: 'processing',
        nextStep: 'Analysis in progress. You will be notified when template is ready.'
      });

    } catch (error: any) {
      console.error('Viral URL analysis error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Step 2: Apply created template to user's video
   */
  app.post('/api/templates/apply-to-user-video', viralUpload.single('userVideo'), authenticateUser, async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No user video file uploaded' });
      }

      const { templateId, title } = req.body;
      
      if (!templateId) {
        return res.status(400).json({ error: 'Template ID is required' });
      }

      const userVideoPath = req.file.path;
      const videoTitle = title || req.file.originalname;

      console.log(`Applying template ${templateId} to user video: ${videoTitle}`);

      // Get template from database
      const template = await storage.getTemplate(templateId);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      // Get template assets from cloud storage
      const templateAssets = await templateStorage.getTemplateAssets(templateId);
      if (!templateAssets) {
        return res.status(404).json({ error: 'Template assets not found in cloud storage' });
      }

      // Create user video record
      const userVideoData = {
        userId: req.userId,
        title: videoTitle,
        originalUrl: userVideoPath,
        templateId: templateId,
        status: 'processing' as const,
        duration: 0,
        audioMatched: true
      };

      const userVideo = await storage.createVideo(userVideoData);

      // Create processing job for template application
      const applicationJobData = {
        videoId: userVideo.id,
        jobType: 'template_application' as const,
        status: 'processing' as const,
        progress: 0,
        metadata: {
          templateId,
          templateAssets,
          userVideoPath,
          originalTemplate: template.name
        }
      };

      const applicationJob = await storage.createProcessingJob(applicationJobData);

      // Start background processing
      setTimeout(async () => {
        try {
          // Simulate template application process
          for (let progress = 0; progress <= 100; progress += 25) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await storage.updateJobProgress(applicationJob.id, progress, 'processing');
          }

          // Update video with styled URL
          const styledVideoUrl = `/uploads/styled/${userVideo.id}_styled.mp4`;
          await storage.updateVideo(userVideo.id, {
            styledUrl: styledVideoUrl,
            status: 'completed'
          });

          await storage.updateJobProgress(applicationJob.id, 100, 'completed');

        } catch (bgError) {
          console.error('Template application error:', bgError);
          await storage.updateJobProgress(applicationJob.id, 0, 'failed');
          await storage.updateProcessingJobError(applicationJob.id, bgError.message);
        }
      }, 1000);

      res.status(202).json({
        success: true,
        message: 'Template application started',
        userVideo,
        template: {
          id: templateId,
          name: template.name,
          assets: templateAssets
        },
        applicationJobId: applicationJob.id,
        status: 'processing',
        nextStep: 'Template is being applied to your video. Check job status for progress.'
      });

    } catch (error: any) {
      console.error('Template application error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get template assets from cloud storage
   */
  app.get('/api/templates/:templateId/assets', authenticateUser, async (req: any, res) => {
    try {
      const { templateId } = req.params;
      
      const templateAssets = await templateStorage.getTemplateAssets(templateId);
      if (!templateAssets) {
        return res.status(404).json({ error: 'Template assets not found' });
      }

      res.json({
        success: true,
        templateId,
        assets: templateAssets
      });

    } catch (error: any) {
      console.error('Error fetching template assets:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * List all viral templates in cloud storage
   */
  app.get('/api/templates/viral/list', async (req, res) => {
    try {
      const viralTemplates = await templateStorage.listTemplates();
      
      res.json({
        success: true,
        templates: viralTemplates,
        count: viralTemplates.length
      });

    } catch (error: any) {
      console.error('Error listing viral templates:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get template asset URL (for previews, downloads, etc.)
   */
  app.get('/api/templates/:templateId/asset/:assetName', async (req, res) => {
    try {
      const { templateId, assetName } = req.params;
      
      const assetUrl = await templateStorage.getAssetUrl(templateId, assetName);
      
      res.json({
        success: true,
        assetUrl
      });

    } catch (error: any) {
      console.error('Error getting template asset URL:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Delete viral template and all its assets
   */
  app.delete('/api/templates/:templateId/viral', authenticateUser, async (req: any, res) => {
    try {
      const { templateId } = req.params;
      
      // Delete from cloud storage
      const cloudDeleted = await templateStorage.deleteTemplate(templateId);
      
      if (cloudDeleted) {
        // Delete from database
        await storage.deleteTemplate(templateId);
        
        res.json({
          success: true,
          message: 'Viral template deleted successfully'
        });
      } else {
        res.status(500).json({ error: 'Failed to delete template from cloud storage' });
      }

    } catch (error: any) {
      console.error('Error deleting viral template:', error);
      res.status(500).json({ error: error.message });
    }
  });
}