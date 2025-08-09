import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { AIAnalysisService } from './ai-analysis.js';
import { db } from '../db/index.js';
import { renderJobs, videoUploads } from '../../shared/skify-schema.js';
import { eq } from 'drizzle-orm';

// Redis connection for BullMQ (lazy connection)
let redisConnection: IORedis | null = null;
let useMemoryQueue = false;

// Initialize Redis connection only when needed
async function initializeRedis() {
  if (redisConnection !== null) return redisConnection;
  
  try {
    redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      lazyConnect: true,
      connectTimeout: 5000,
      commandTimeout: 5000
    });
    
    await redisConnection.ping();
    console.log('✅ Redis connection established');
    return redisConnection;
  } catch (error) {
    console.warn('Redis not available, using memory queue fallback:', error.message);
    useMemoryQueue = true;
    if (redisConnection) {
      redisConnection.disconnect();
      redisConnection = null;
    }
    return null;
  }
}

export class QueueService {
  private analysisQueue: Queue | any;
  private renderQueue: Queue | any;
  private workers: Worker[] = [];
  private initialized = false;

  constructor() {
    // Initialize queues as memory-based by default
    this.analysisQueue = this.createMemoryQueue('analysis');
    this.renderQueue = this.createMemoryQueue('render');
    
    // Try to initialize Redis connection in background
    this.initializeAsync();
  }

  private async initializeAsync() {
    try {
      const redis = await initializeRedis();
      if (redis && !useMemoryQueue) {
        // Replace memory queues with Redis queues if connection successful
        this.analysisQueue = new Queue('video-analysis', { connection: redis });
        this.renderQueue = new Queue('video-render', { connection: redis });
        this.startWorkers();
        this.initialized = true;
        console.log('✅ QueueService initialized with Redis');
      } else {
        console.log('✅ QueueService initialized with memory fallback');
        this.initialized = true;
      }
    } catch (error) {
      console.warn('QueueService initialization warning:', error.message);
      // Already using memory queues as fallback
      this.initialized = true;
    }
  }

  private createMemoryQueue(name: string): any {
    // Simple memory-based queue for development
    return {
      add: async (jobName: string, data: any, options?: any) => {
        const jobId = `${name}-${Date.now()}-${Math.random()}`;
        console.log(`Memory Queue: Added ${jobName} job ${jobId}`);
        
        // Simulate async processing
        setTimeout(() => {
          this.processMemoryJob(name, jobId, data);
        }, 1000);
        
        return { id: jobId };
      },
      getJob: async (jobId: string) => {
        return { id: jobId, data: {}, progress: 50 };
      }
    };
  }

  private async processMemoryJob(queueName: string, jobId: string, data: any) {
    try {
      if (queueName === 'analysis') {
        await this.processAnalysisJob({ id: jobId, data } as any);
      } else if (queueName === 'render') {
        await this.processRenderJob({ id: jobId, data } as any);
      }
    } catch (error) {
      console.error(`Memory job ${jobId} failed:`, error);
    }
  }

  private startWorkers() {
    if (useMemoryQueue) return;

    // Analysis worker
    const analysisWorker = new Worker('video-analysis', async (job) => {
      return this.processAnalysisJob(job);
    }, { 
      connection: redisConnection,
      concurrency: 2
    });

    // Render worker
    const renderWorker = new Worker('video-render', async (job) => {
      return this.processRenderJob(job);
    }, { 
      connection: redisConnection,
      concurrency: 1 // Limit concurrent renders
    });

    this.workers = [analysisWorker, renderWorker];

    // Worker event handlers
    analysisWorker.on('completed', (job) => {
      console.log(`Analysis job ${job.id} completed`);
    });

    renderWorker.on('completed', (job) => {
      console.log(`Render job ${job.id} completed`);
    });

    analysisWorker.on('failed', (job, err) => {
      console.error(`Analysis job ${job?.id} failed:`, err.message);
    });

    renderWorker.on('failed', (job, err) => {
      console.error(`Render job ${job?.id} failed:`, err.message);
    });
  }

  // Queue video analysis job
  async queueAnalysis(videoId: string, videoUrl: string, userId: string) {
    const jobData = {
      videoId,
      videoUrl,
      userId,
      timestamp: new Date().toISOString()
    };

    const job = await this.analysisQueue.add('analyze-video', jobData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });

    return job.id;
  }

  // Queue render job
  async queueRender(renderJobId: string, templateId: string, sourceMediaIds: string[], renderSettings: any) {
    const jobData = {
      renderJobId,
      templateId,
      sourceMediaIds,
      renderSettings,
      timestamp: new Date().toISOString()
    };

    const job = await this.renderQueue.add('render-video', jobData, {
      attempts: 2,
      priority: renderSettings.priority || 5,
      backoff: {
        type: 'exponential',
        delay: 5000
      }
    });

    return job.id;
  }

  // Process analysis job
  private async processAnalysisJob(job: Job) {
    const { videoId, videoUrl, userId } = job.data;
    
    try {
      // Update job progress
      await job.updateProgress(10);

      // Initialize AI service
      const aiService = new AIAnalysisService();

      // Update progress
      await job.updateProgress(30);

      // Perform analysis
      const analysisResult = await aiService.analyzeVideo(videoUrl, videoId);

      // Update progress
      await job.updateProgress(80);

      // Update video record with analysis result
      await db.update(videoUploads)
        .set({
          analysisResult: analysisResult as any,
          status: 'analyzed',
          updatedAt: new Date()
        })
        .where(eq(videoUploads.id, videoId));

      // Complete job
      await job.updateProgress(100);

      return {
        success: true,
        analysisId: analysisResult.id,
        confidence: analysisResult.confidence
      };

    } catch (error) {
      // Update video status to failed
      await db.update(videoUploads)
        .set({
          status: 'failed',
          updatedAt: new Date()
        })
        .where(eq(videoUploads.id, videoId));

      throw error;
    }
  }

  // Process render job
  private async processRenderJob(job: Job) {
    const { renderJobId, templateId, sourceMediaIds, renderSettings } = job.data;
    
    try {
      // Update render job status
      await db.update(renderJobs)
        .set({
          status: 'processing',
          startedAt: new Date(),
          progress: 10
        })
        .where(eq(renderJobs.id, renderJobId));

      await job.updateProgress(10);

      // Simulate render processing
      for (let progress = 20; progress <= 90; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate work
        
        await db.update(renderJobs)
          .set({ progress })
          .where(eq(renderJobs.id, renderJobId));
        
        await job.updateProgress(progress);
      }

      // Generate result URL (in production, this would be the actual rendered video)
      const resultUrl = `https://renders.skify.com/${renderJobId}.mp4`;

      // Complete render job
      await db.update(renderJobs)
        .set({
          status: 'completed',
          progress: 100,
          resultUrl,
          completedAt: new Date()
        })
        .where(eq(renderJobs.id, renderJobId));

      await job.updateProgress(100);

      return {
        success: true,
        resultUrl
      };

    } catch (error) {
      // Update render job as failed
      await db.update(renderJobs)
        .set({
          status: 'failed',
          errorMessage: error.message,
          completedAt: new Date()
        })
        .where(eq(renderJobs.id, renderJobId));

      throw error;
    }
  }

  // Get job status
  async getJobStatus(jobId: string) {
    try {
      const job = await this.analysisQueue.getJob(jobId) || await this.renderQueue.getJob(jobId);
      
      if (!job) {
        return null;
      }

      return {
        id: job.id,
        progress: job.progress || 0,
        state: await job.getState(),
        data: job.data,
        result: job.returnvalue,
        error: job.failedReason
      };
    } catch (error) {
      return null;
    }
  }

  // Cleanup on shutdown
  async close() {
    await Promise.all(this.workers.map(worker => worker.close()));
    await redisConnection.quit();
  }
}