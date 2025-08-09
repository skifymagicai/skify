// Simple memory-based queue service for development
export class SimpleQueueService {
  private jobs: Map<string, any> = new Map();

  constructor() {
    console.log('📋 Simple Queue Service initialized (Memory-based)');
  }

  async addAnalysisJob(videoId: string, data: any): Promise<string> {
    const jobId = `analysis-${videoId}-${Date.now()}`;
    
    this.jobs.set(jobId, {
      id: jobId,
      type: 'analysis',
      status: 'queued',
      progress: 0,
      data,
      createdAt: new Date()
    });

    console.log(`📋 Analysis job queued: ${jobId}`);
    
    // Simulate processing after a delay
    setTimeout(() => this.processAnalysisJob(jobId), 2000);
    
    return jobId;
  }

  async addRenderJob(templateId: string, data: any): Promise<string> {
    const jobId = `render-${templateId}-${Date.now()}`;
    
    this.jobs.set(jobId, {
      id: jobId,
      type: 'render',
      status: 'queued',
      progress: 0,
      data,
      createdAt: new Date()
    });

    console.log(`📋 Render job queued: ${jobId}`);
    
    // Simulate processing after a delay
    setTimeout(() => this.processRenderJob(jobId), 3000);
    
    return jobId;
  }

  async getJob(jobId: string) {
    return this.jobs.get(jobId);
  }

  private async processAnalysisJob(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    console.log(`🔄 Processing analysis job: ${jobId}`);
    
    // Update job status
    job.status = 'processing';
    job.progress = 50;
    
    // Simulate AI analysis completion
    setTimeout(() => {
      job.status = 'completed';
      job.progress = 100;
      job.completedAt = new Date();
      
      console.log(`✅ Analysis job completed: ${jobId}`);
    }, 5000);
  }

  private async processRenderJob(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    console.log(`🔄 Processing render job: ${jobId}`);
    
    // Update job status
    job.status = 'processing';
    job.progress = 25;
    
    // Simulate render completion
    setTimeout(() => {
      job.progress = 75;
    }, 2000);
    
    setTimeout(() => {
      job.status = 'completed';
      job.progress = 100;
      job.completedAt = new Date();
      job.resultUrl = `/storage/renders/${jobId}.mp4`;
      
      console.log(`✅ Render job completed: ${jobId}`);
    }, 8000);
  }

  async close() {
    console.log('📋 Simple Queue Service closed');
    return Promise.resolve();
  }
}