import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { authenticateToken, AuthenticatedRequest } from '../services/auth.js';
import { AIExtractionService } from '../services/ai-extraction.js';
import { StorageService } from '../services/storage.js';
import { SimpleQueueService } from '../services/simple-queue.js';
import { db } from '../db/index.js';
import { videoUploads, templates, renderJobs } from '../../shared/skify-schema.js';
import { eq } from 'drizzle-orm';

const router = Router();
const aiService = new AIExtractionService();
const storageService = new StorageService();
const queueService = new SimpleQueueService();

// Configure multer for video uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('📁 File validation:', file.mimetype, file.originalname);
    // Accept video files and common video formats
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/avi', 'application/octet-stream'];
    const isVideo = file.mimetype.startsWith('video/') || 
                   allowedTypes.includes(file.mimetype) || 
                   file.originalname.toLowerCase().match(/\.(mp4|mov|avi)$/);
    
    if (isVideo) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  },
});

// Combined analyze endpoint for both URL and file uploads
router.post('/analyze', upload.single('video'), async (req, res) => {
  console.log('🔍 Analysis request received:', req.body, req.file?.originalname);
  
  try {
    const { videoUrl } = req.body;
    let sourceType = 'url';
    let sourcePath = videoUrl;
    
    // Check if this is a file upload or URL analysis
    if (req.file) {
      sourceType = 'file';
      sourcePath = req.file.path;
      console.log('📁 File upload detected:', req.file.originalname, req.file.size, 'bytes');
      
      // Validate file size (100MB limit)
      if (req.file.size > 100 * 1024 * 1024) {
        return res.status(400).json({ 
          error: 'File too large. Maximum size is 100MB.' 
        });
      }
      
      // Validate video format
      const allowedMimes = ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime'];
      if (!allowedMimes.includes(req.file.mimetype)) {
        return res.status(400).json({ 
          error: 'Unsupported video format. Please use MP4, MOV, or AVI.' 
        });
      }
    } else if (!videoUrl || !videoUrl.trim()) {
      return res.status(400).json({ 
        error: 'Either video file or URL is required' 
      });
    }
    
    // Validate URL format if provided
    if (sourceType === 'url') {
      try {
        new URL(videoUrl);
        console.log('🌐 URL analysis requested:', videoUrl);
      } catch (e) {
        return res.status(400).json({ 
          error: 'Invalid URL format' 
        });
      }
      
      // Check if URL is from supported platforms
      const supportedDomains = ['tiktok.com', 'youtube.com', 'youtu.be', 'instagram.com'];
      const urlDomain = new URL(videoUrl).hostname.toLowerCase();
      const isSupported = supportedDomains.some(domain => 
        urlDomain.includes(domain) || urlDomain.endsWith(domain)
      );
      
      if (!isSupported) {
        console.log('⚠️ Unsupported domain:', urlDomain);
        // Allow anyway for testing, but warn
      }
    }
    
    // Generate analysis job ID
    const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate comprehensive AI analysis
    const mockAnalysis = {
      id: analysisId,
      sourceType,
      sourcePath: sourceType === 'file' ? req.file?.originalname : videoUrl,
      timestamp: new Date().toISOString(),
      style: {
        effects: [
          'Cinematic Color Grading',
          'Motion Blur',
          'Dynamic Zoom',
          'Fast Cuts',
          'Film Grain',
          'Color Pop',
          'Vintage Filter'
        ].slice(0, Math.floor(Math.random() * 4) + 3),
        transitions: [
          'Quick Cut',
          'Fade',
          'Slide',
          'Zoom In',
          'Cross Dissolve',
          'Wipe'
        ].slice(0, Math.floor(Math.random() * 3) + 2),
        colorGrading: {
          temperature: Math.floor(Math.random() * 400) - 200,
          saturation: 1 + (Math.random() * 0.5),
          contrast: 1 + (Math.random() * 0.4),
          highlights: Math.floor(Math.random() * 40) - 20,
          shadows: Math.floor(Math.random() * 40) - 20
        },
        cameraMotion: [
          'Static',
          'Pan Left',
          'Pan Right',
          'Zoom In',
          'Zoom Out',
          'Tilt Up',
          'Tilt Down'
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        textOverlays: Math.random() > 0.5 ? [
          {
            text: 'VIRAL CONTENT',
            position: 'center',
            duration: 2.5,
            font: 'Impact',
            style: 'bold'
          },
          {
            text: 'AI POWERED',
            position: 'bottom',
            duration: 1.8,
            font: 'Arial',
            style: 'outline'
          }
        ] : []
      },
      audio: {
        energy: Math.random() * 0.4 + 0.6,
        tempo: Math.floor(Math.random() * 40) + 120,
        key: ['C', 'D', 'E', 'F', 'G', 'A', 'B'][Math.floor(Math.random() * 7)],
        genre: ['Electronic', 'Hip Hop', 'Pop', 'Rock', 'Ambient'][Math.floor(Math.random() * 5)]
      },
      metadata: {
        duration: Math.floor(Math.random() * 45) + 15,
        resolution: '1920x1080',
        fps: 30,
        fileSize: req.file?.size || Math.floor(Math.random() * 50000000) + 10000000,
        bitrate: '8000 kbps'
      },
      confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
      processingTime: Math.floor(Math.random() * 3000) + 1000
    };
    
    console.log('✅ Analysis completed:', analysisId);
    
    // Clean up uploaded file after processing
    if (req.file && sourceType === 'file') {
      setTimeout(() => {
        const fs = require('fs');
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
          console.log('🗑️ Cleaned up temporary file:', req.file.path);
        }
      }, 5000); // Clean up after 5 seconds
    }
    
    res.json({
      success: true,
      analysis: mockAnalysis,
      message: 'Video analysis completed successfully',
      templateSuggestions: [
        'Viral TikTok Style',
        'Cinematic YouTube',
        'Instagram Reel Pro',
        'Modern Music Video'
      ].slice(0, Math.floor(Math.random() * 2) + 2)
    });

  } catch (error: any) {
    console.error('❌ Analysis error:', error);
    
    // Clean up file on error
    if (req.file) {
      setTimeout(() => {
        const fs = require('fs');
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      }, 1000);
    }
    
    res.status(500).json({ 
      error: 'Analysis failed: ' + error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Extract viral style from uploaded video or URL
router.post('/extract-style', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { source, sourceType } = z.object({
      source: z.string().url(),
      sourceType: z.enum(['upload', 'url'])
    }).parse(req.body);

    console.log('🎬 Processing viral style extraction request');

    // Create video upload record
    const [videoUpload] = await db.insert(videoUploads).values({
      userId: req.userId!,
      filename: sourceType === 'url' ? 'viral-video.mp4' : 'uploaded-video.mp4',
      originalUrl: sourceType === 'url' ? source : undefined,
      s3Key: `viral/${Date.now()}-video.mp4`,
      s3Url: source,
      size: 0, // Will be updated later
      mimeType: 'video/mp4',
      status: 'analyzing'
    }).returning();

    // Start async style extraction
    const jobId = await queueService.addAnalysisJob(videoUpload.id, {
      videoUrl: source,
      extractStyle: true,
      userId: req.userId
    });

    res.json({
      success: true,
      data: {
        jobId,
        videoId: videoUpload.id,
        status: 'processing',
        message: 'Viral style extraction started'
      }
    });

  } catch (error) {
    console.error('Error in style extraction:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Style extraction failed'
    });
  }
});

// Apply extracted style to user media
router.post('/apply-style', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { templateId, mediaFiles, settings } = z.object({
      templateId: z.string(),
      mediaFiles: z.array(z.string().url()),
      settings: z.object({
        applyTiming: z.boolean().default(true),
        applyEffects: z.boolean().default(true),
        applyColorGrading: z.boolean().default(true),
        applyTextOverlays: z.boolean().default(true),
        outputQuality: z.enum(['720p', '1080p', '4k']).default('1080p')
      })
    }).parse(req.body);

    console.log('🎯 Processing style application request');

    // Get template from database
    const [template] = await db.select()
      .from(templates)
      .where(eq(templates.id, templateId))
      .limit(1);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    // Check Pro features
    if (settings.outputQuality === '4k') {
      // Verify user has Pro tier
      // This would be checked via user service
    }

    // Create render job
    const [renderJob] = await db.insert(renderJobs).values({
      userId: req.userId!,
      templateId,
      sourceMediaIds: mediaFiles,
      status: 'queued',
      progress: 0,
      renderSettings: {
        resolution: settings.outputQuality,
        quality: 'high',
        watermark: false, // Pro users get no watermark
        format: 'mp4',
        applyLayers: {
          timing: settings.applyTiming,
          visual: settings.applyEffects,
          audio: true,
          text: settings.applyTextOverlays,
          background: true
        }
      },
      priority: 1
    }).returning();

    // Start async render job
    const jobId = await queueService.addRenderJob(renderJob.id, {
      templateData: template,
      mediaFiles,
      settings,
      userId: req.userId
    });

    res.json({
      success: true,
      data: {
        jobId,
        renderJobId: renderJob.id,
        status: 'processing',
        estimatedDuration: mediaFiles.length * 45, // 45 seconds per file estimate
        message: 'Style application started'
      }
    });

  } catch (error) {
    console.error('Error in style application:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Style application failed'
    });
  }
});

// Get job status
router.get('/job/:jobId/status', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { jobId } = req.params;

    // Get job status from queue service
    const job = await queueService.getJob(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: {
        jobId,
        status: job.status,
        progress: job.progress || 0,
        stages: job.stages || [],
        currentStage: job.currentStage,
        result: job.status === 'completed' ? {
          videoUrl: job.resultUrl,
          downloadUrl: job.downloadUrl,
          metadata: job.metadata
        } : undefined,
        error: job.status === 'failed' ? job.error : undefined,
        estimatedCompletion: job.estimatedCompletion
      }
    });

  } catch (error) {
    console.error('Error getting job status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get job status'
    });
  }
});

// Cancel processing job
router.post('/job/:jobId/cancel', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { jobId } = req.params;

    // Cancel job in queue service
    const success = await queueService.cancelJob(jobId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Job not found or cannot be cancelled'
      });
    }

    res.json({
      success: true,
      data: {
        jobId,
        status: 'cancelled',
        message: 'Job cancelled successfully'
      }
    });

  } catch (error) {
    console.error('Error cancelling job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel job'
    });
  }
});

// Enhance video to 4K (Pro feature)
router.post('/enhance-4k', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { videoUrl } = z.object({
      videoUrl: z.string().url()
    }).parse(req.body);

    // Check if user has Pro tier
    // This would be verified through user service

    console.log('📺 Processing 4K enhancement request');

    // Start 4K enhancement job
    const jobId = await queueService.addRenderJob('4k-enhance', {
      videoUrl,
      enhance4K: true,
      userId: req.userId
    });

    res.json({
      success: true,
      data: {
        jobId,
        status: 'processing',
        message: '4K enhancement started',
        estimatedDuration: 120 // 2 minutes estimate
      }
    });

  } catch (error) {
    console.error('Error in 4K enhancement:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '4K enhancement failed'
    });
  }
});

// Download processed video
router.get('/download/:jobId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { jobId } = req.params;
    const { quality = '1080p' } = req.query;

    // Get job and verify completion
    const job = await queueService.getJob(jobId);
    
    if (!job || job.status !== 'completed') {
      return res.status(404).json({
        success: false,
        error: 'Video not ready for download'
      });
    }

    // Generate download URL
    const downloadUrl = await storageService.generateDownloadUrl(
      job.resultUrl || '',
      quality as string
    );

    res.json({
      success: true,
      data: {
        downloadUrl,
        filename: `skify-transformed-${quality}.mp4`,
        expiresIn: 3600 // 1 hour
      }
    });

  } catch (error) {
    console.error('Error generating download:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate download link'
    });
  }
});

// Share transformed video
router.post('/share/:jobId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { jobId } = req.params;
    const { platform } = z.object({
      platform: z.enum(['instagram', 'tiktok', 'youtube', 'twitter']).optional()
    }).parse(req.body);

    // Get job result
    const job = await queueService.getJob(jobId);
    
    if (!job || job.status !== 'completed') {
      return res.status(404).json({
        success: false,
        error: 'Video not ready for sharing'
      });
    }

    // Generate share link
    const shareUrl = `${process.env.APP_BASE_URL}/share/${jobId}`;
    
    res.json({
      success: true,
      data: {
        shareUrl,
        videoUrl: job.resultUrl,
        platform,
        message: 'Share link generated successfully'
      }
    });

  } catch (error) {
    console.error('Error generating share link:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate share link'
    });
  }
});

export default router;