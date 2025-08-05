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

  // ===== VIDEO UPLOAD AND PROCESSING =====
  
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
          await storage.updateVideoStatus(video.id, 'analyzed');
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

  // ===== VIDEO STYLE APPLICATION =====
  
  app.post('/api/videos/:id/apply-template', authenticateUser, async (req: any, res) => {
    try {
      const { templateId } = req.body;
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
        jobType: 'template_application',
        metadata: { templateId, originalUrl: video.originalUrl }
      });

      // Simulate template application processing
      setTimeout(async () => {
        try {
          const styledUrl = `/styled/${video.id}_${templateId}.mp4`; // In production, generate actual styled video
          
          await storage.updateVideoStatus(video.id, 'styled', styledUrl);
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
      }, 5000); // Simulate 5-second processing

      res.json({ 
        message: 'Template application started', 
        jobId: applicationJob.id,
        estimatedTime: '5-10 seconds'
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
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
