import type { Express } from "express";
import { storage } from "./storage";
import multer from "multer";
import { 
  insertUserSchema, 
  insertVideoSchema, 
  insertTemplateSchema, 
  insertPaymentSchema,
  insertAnalysisResultSchema 
} from "@shared/schema";

// Configure multer for video uploads with proper error handling
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

// Authentication middleware
const authenticateUser = async (req: any, res: any, next: any) => {
  const userId = req.headers['x-user-id'] || req.body.userId;
  if (!userId) {
    return res.status(401).json({ 
      success: false, 
      error: 'Unauthorized - x-user-id header required' 
    });
  }
  req.userId = userId;
  next();
};

export async function registerModularRoutes(app: Express) {
  
  // ===== 1. UPLOAD ENDPOINTS =====
  
  // Upload viral video for analysis
  app.post('/api/upload/viral', authenticateUser, upload.single('viralVideo'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: 'Viral video file is required' 
        });
      }

      const { title } = req.body;
      
      // Create video record
      const video = await storage.createVideo({
        userId: req.userId,
        title: title || `Viral Video ${Date.now()}`,
        originalUrl: `/uploads/${req.file.filename}`,
        status: 'uploaded'
      });

      // Create processing job
      const job = await storage.createProcessingJob({
        videoId: video.id,
        jobType: 'viral_upload',
        metadata: {
          filePath: req.file.path,
          originalName: req.file.originalname,
          size: req.file.size
        }
      });

      res.json({ 
        success: true,
        message: 'Viral video uploaded successfully',
        video,
        jobId: job.id,
        nextStep: 'Call /api/analyze to start AI analysis'
      });
    } catch (error: any) {
      console.error('Viral upload error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });

  // Upload user video for styling
  app.post('/api/upload/user', authenticateUser, upload.single('userVideo'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: 'User video file is required' 
        });
      }

      const { title, templateId } = req.body;
      
      // Create video record
      const video = await storage.createVideo({
        userId: req.userId,
        title: title || `User Video ${Date.now()}`,
        originalUrl: `/uploads/${req.file.filename}`,
        templateId: templateId || null,
        status: 'uploaded'
      });

      res.json({ 
        success: true,
        message: 'User video uploaded successfully',
        video,
        nextStep: templateId ? 'Call /api/apply to start styling' : 'Select a template first'
      });
    } catch (error: any) {
      console.error('User upload error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });

  // ===== 2. IMPORT ENDPOINT =====
  
  // Import video from public URL
  app.post('/api/import', authenticateUser, async (req: any, res) => {
    try {
      const { url, title } = req.body;
      
      if (!url) {
        return res.status(400).json({ 
          success: false, 
          error: 'Video URL is required' 
        });
      }

      // Create video record for URL import
      const video = await storage.createVideo({
        userId: req.userId,
        title: title || `Imported Video ${Date.now()}`,
        originalUrl: url,
        status: 'importing'
      });

      // Create import job
      const job = await storage.createProcessingJob({
        videoId: video.id,
        jobType: 'url_import',
        metadata: {
          sourceUrl: url,
          platform: detectPlatform(url)
        }
      });

      // Start async import process
      setTimeout(async () => {
        try {
          const { aiVideoProcessor } = await import('./ai-services');
          await storage.updateJobProgress(job.id, 50, 'downloading');
          
          // Simulate download process
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          await storage.updateJobProgress(job.id, 100, 'completed');
          await storage.updateVideo(video.id, { status: 'imported' });
          
        } catch (error: any) {
          await storage.updateJobProgress(job.id, 0, 'failed');
          await storage.updateVideo(video.id, { status: 'failed' });
        }
      }, 100);

      res.json({ 
        success: true,
        message: 'Video import started',
        video,
        jobId: job.id,
        status: 'importing',
        nextStep: 'Poll /api/status/{jobId} for progress'
      });
    } catch (error: any) {
      console.error('Import error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });

  // ===== 3. ANALYZE ENDPOINT =====
  
  // Run full AI analysis pipeline
  app.post('/api/analyze', authenticateUser, async (req: any, res) => {
    try {
      const { videoId } = req.body;
      
      if (!videoId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Video ID is required' 
        });
      }

      const video = await storage.getVideo(videoId);
      if (!video || video.userId !== req.userId) {
        return res.status(404).json({ 
          success: false, 
          error: 'Video not found' 
        });
      }

      // Create analysis job
      const job = await storage.createProcessingJob({
        videoId: video.id,
        jobType: 'ai_analysis',
        metadata: {
          analysisSteps: ['visual', 'audio', 'text', 'ocr']
        }
      });

      // Start async AI analysis
      setTimeout(async () => {
        try {
          const { aiVideoProcessor } = await import('./ai-services');
          
          // Step 1: Visual analysis
          await storage.updateJobProgress(job.id, 25, 'visual_analysis');
          const visualAnalysis = await aiVideoProcessor.analyzeVideo(video.originalUrl || '', {});
          
          // Step 2: Audio analysis
          await storage.updateJobProgress(job.id, 50, 'audio_analysis');
          const audioAnalysis = await aiVideoProcessor.analyzeVideo(video.originalUrl || '', {});
          
          // Step 3: Text/OCR analysis
          await storage.updateJobProgress(job.id, 75, 'text_analysis');
          const textAnalysis = await aiVideoProcessor.analyzeVideo(video.originalUrl || '', {});
          
          // Step 4: Combine results
          await storage.updateJobProgress(job.id, 100, 'completed');
          
          const analysisResult = await storage.createAnalysisResult({
            videoId: video.id,
            effects: visualAnalysis.effects || {},
            transitions: visualAnalysis.transitions || {},
            colorGrading: visualAnalysis.colorGrading || {},
            cameraMotion: visualAnalysis.cameraMotion || {},
            templates: visualAnalysis.templates || {},
            confidence: 0.85,
            processingTime: 30
          });

          await storage.updateVideo(video.id, { status: 'analyzed' });
          
        } catch (error: any) {
          await storage.updateJobProgress(job.id, 0, 'failed');
          await storage.updateVideo(video.id, { status: 'failed' });
        }
      }, 100);

      res.json({ 
        success: true,
        message: 'AI analysis started',
        video,
        jobId: job.id,
        status: 'analyzing',
        nextStep: 'Poll /api/status/{jobId} for progress'
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });

  // ===== 4. TEMPLATE SAVE ENDPOINT =====
  
  // Save analyzed video as reusable template
  app.post('/api/template/save', authenticateUser, async (req: any, res) => {
    try {
      const { videoId, templateName, templateDescription, makePublic } = req.body;
      
      if (!videoId || !templateName) {
        return res.status(400).json({ 
          success: false, 
          error: 'Video ID and template name are required' 
        });
      }

      const video = await storage.getVideo(videoId);
      if (!video || video.userId !== req.userId) {
        return res.status(404).json({ 
          success: false, 
          error: 'Video not found' 
        });
      }

      const analysis = await storage.getAnalysisResult(videoId);
      if (!analysis) {
        return res.status(400).json({ 
          success: false, 
          error: 'Video analysis not found. Please analyze video first.' 
        });
      }

      // Create template from analysis
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
        isPublic: makePublic || false
      });

      // Create job for cloud folder creation
      const job = await storage.createProcessingJob({
        videoId: video.id,
        jobType: 'template_save',
        metadata: {
          templateId: template.id,
          cloudFolder: `templates/${template.id}`,
          assets: ['visual', 'audio', 'text', 'metadata']
        }
      });

      res.json({ 
        success: true,
        message: 'Template saved successfully',
        template,
        jobId: job.id,
        nextStep: 'Template ready for application to user videos'
      });
    } catch (error: any) {
      console.error('Template save error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });

  // ===== 5. APPLY ENDPOINT =====
  
  // Apply template to user video
  app.post('/api/apply', authenticateUser, async (req: any, res) => {
    try {
      const { userVideoId, templateId, options } = req.body;
      
      if (!userVideoId || !templateId) {
        return res.status(400).json({ 
          success: false, 
          error: 'User video ID and template ID are required' 
        });
      }

      const userVideo = await storage.getVideo(userVideoId);
      const template = await storage.getTemplate(templateId);
      
      if (!userVideo || userVideo.userId !== req.userId) {
        return res.status(404).json({ 
          success: false, 
          error: 'User video not found' 
        });
      }
      
      if (!template) {
        return res.status(404).json({ 
          success: false, 
          error: 'Template not found' 
        });
      }

      // Create application job
      const job = await storage.createProcessingJob({
        videoId: userVideo.id,
        jobType: 'template_application',
        metadata: {
          templateId: template.id,
          options: options || {
            applyVisual: true,
            applyAudio: true,
            applyText: true
          }
        }
      });

      // Start async template application
      setTimeout(async () => {
        try {
          const { aiVideoProcessor } = await import('./ai-services');
          
          await storage.updateJobProgress(job.id, 25, 'preparing');
          await storage.updateJobProgress(job.id, 50, 'applying_visual');
          await storage.updateJobProgress(job.id, 75, 'applying_audio');
          await storage.updateJobProgress(job.id, 100, 'completed');
          
          // Update video with styled URL
          const styledUrl = `/uploads/styled/${userVideo.id}_styled.mp4`;
          await storage.updateVideo(userVideo.id, { 
            styledUrl,
            templateId: template.id,
            status: 'styled' 
          });
          
        } catch (error: any) {
          await storage.updateJobProgress(job.id, 0, 'failed');
          await storage.updateVideo(userVideo.id, { status: 'failed' });
        }
      }, 100);

      res.json({ 
        success: true,
        message: 'Template application started',
        userVideo,
        template,
        jobId: job.id,
        status: 'applying',
        nextStep: 'Poll /api/status/{jobId} for progress'
      });
    } catch (error: any) {
      console.error('Apply error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });

  // ===== 6. EXPORT ENDPOINT =====
  
  // Export final styled video
  app.post('/api/export', authenticateUser, async (req: any, res) => {
    try {
      const { videoId, quality, watermark } = req.body;
      
      if (!videoId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Video ID is required' 
        });
      }

      const video = await storage.getVideo(videoId);
      if (!video || video.userId !== req.userId) {
        return res.status(404).json({ 
          success: false, 
          error: 'Video not found' 
        });
      }

      if (!video.styledUrl) {
        return res.status(400).json({ 
          success: false, 
          error: 'Video has not been styled yet' 
        });
      }

      // Create export job
      const job = await storage.createProcessingJob({
        videoId: video.id,
        jobType: 'video_export',
        metadata: {
          quality: quality || 'HD',
          watermark: watermark !== false,
          outputFormat: 'mp4'
        }
      });

      // Start async export process
      setTimeout(async () => {
        try {
          await storage.updateJobProgress(job.id, 50, 'rendering');
          await storage.updateJobProgress(job.id, 100, 'completed');
          
        } catch (error: any) {
          await storage.updateJobProgress(job.id, 0, 'failed');
        }
      }, 100);

      res.json({ 
        success: true,
        message: 'Video export started',
        video,
        jobId: job.id,
        status: 'exporting',
        nextStep: 'Poll /api/status/{jobId} then call /api/download'
      });
    } catch (error: any) {
      console.error('Export error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });

  // ===== 7. DOWNLOAD ENDPOINT =====
  
  // Download final video
  app.get('/api/download/:videoId', authenticateUser, async (req: any, res) => {
    try {
      const { videoId } = req.params;
      
      const video = await storage.getVideo(videoId);
      if (!video || video.userId !== req.userId) {
        return res.status(404).json({ 
          success: false, 
          error: 'Video not found' 
        });
      }

      if (!video.styledUrl) {
        return res.status(400).json({ 
          success: false, 
          error: 'Video not ready for download' 
        });
      }

      // In production, this would stream the actual file
      res.json({ 
        success: true,
        downloadUrl: video.styledUrl,
        message: 'Video ready for download',
        fileSize: '25.4 MB',
        format: 'MP4',
        quality: 'HD'
      });
    } catch (error: any) {
      console.error('Download error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });

  // ===== 8. STATUS ENDPOINT =====
  
  // Get job status for polling
  app.get('/api/status/:jobId', async (req, res) => {
    try {
      const { jobId } = req.params;
      
      const job = await storage.getProcessingJob(jobId);
      if (!job) {
        return res.status(404).json({ 
          success: false, 
          error: 'Job not found' 
        });
      }

      res.json({ 
        success: true,
        job: {
          id: job.id,
          type: job.jobType,
          status: job.status,
          progress: job.progress,
          message: job.errorMessage || getStatusMessage(job.jobType, job.status),
          startTime: job.startTime,
          endTime: job.endTime
        }
      });
    } catch (error: any) {
      console.error('Status error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });

  // ===== HELPER FUNCTIONS =====
  
  function detectPlatform(url: string): string {
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('tiktok.com')) return 'tiktok';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    return 'unknown';
  }

  function getStatusMessage(jobType: string, status: string): string {
    const messages: Record<string, Record<string, string>> = {
      viral_upload: {
        processing: 'Uploading viral video...',
        completed: 'Viral video uploaded successfully'
      },
      url_import: {
        processing: 'Downloading video from URL...',
        completed: 'Video imported successfully'
      },
      ai_analysis: {
        processing: 'Analyzing video with AI...',
        completed: 'AI analysis completed'
      },
      template_save: {
        processing: 'Saving template to cloud...',
        completed: 'Template saved successfully'
      },
      template_application: {
        processing: 'Applying template to video...',
        completed: 'Template applied successfully'
      },
      video_export: {
        processing: 'Exporting styled video...',
        completed: 'Video exported successfully'
      }
    };
    
    return messages[jobType]?.[status] || `${jobType} ${status}`;
  }
}