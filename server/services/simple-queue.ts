// Processing stages for job tracking
const defaultProcessingStages = [
  { id: 'extraction', name: 'Style Extraction', progress: 0, status: 'pending' as const },
  { id: 'audio', name: 'Audio Analysis', progress: 0, status: 'pending' as const },
  { id: 'text', name: 'Text & Overlays', progress: 0, status: 'pending' as const },
  { id: 'visual', name: 'Visual Effects', progress: 0, status: 'pending' as const },
  { id: 'application', name: 'Applying Style', progress: 0, status: 'pending' as const }
];

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
      stages: [...defaultProcessingStages],
      currentStage: 'extraction',
      createdAt: new Date()
    });

    console.log(`📋 Analysis job queued: ${jobId}`);
    
    // Simulate processing after a delay
    setTimeout(() => this.processAnalysisJob(jobId), 1000);
    
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
      stages: [...defaultProcessingStages],
      currentStage: 'extraction',
      createdAt: new Date()
    });

    console.log(`📋 Render job queued: ${jobId}`);
    
    // Simulate processing after a delay
    setTimeout(() => this.processRenderJob(jobId), 1000);
    
    return jobId;
  }

  async getJob(jobId: string) {
    return this.jobs.get(jobId);
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    if (job.status === 'processing' || job.status === 'queued') {
      job.status = 'cancelled';
      console.log(`❌ Job cancelled: ${jobId}`);
      return true;
    }
    
    return false;
  }

  private async processAnalysisJob(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    console.log(`🔄 Processing analysis job: ${jobId}`);
    
    const stages = job.stages;
    const stageOrder = ['extraction', 'audio', 'text', 'visual', 'application'];
    
    for (let i = 0; i < stageOrder.length; i++) {
      if (job.status === 'cancelled') return;
      
      const stageId = stageOrder[i];
      const stageIndex = stages.findIndex((s: any) => s.id === stageId);
      
      if (stageIndex >= 0) {
        // Update job status
        job.status = 'processing';
        job.currentStage = stageId;
        stages[stageIndex].status = 'processing';
        
        // Simulate stage progress
        for (let progress = 0; progress <= 100; progress += 20) {
          if (job.status === 'cancelled') return;
          
          stages[stageIndex].progress = progress;
          job.progress = ((i * 100 + progress) / (stageOrder.length * 100)) * 100;
          
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        stages[stageIndex].status = 'completed';
      }
    }
    
    // Complete job
    job.status = 'completed';
    job.progress = 100;
    job.completedAt = new Date();
    job.resultUrl = `/api/placeholder/video-result.mp4`;
    job.downloadUrl = `/api/download/${jobId}`;
    
    console.log(`✅ Analysis job completed: ${jobId}`);
  }

  private async processRenderJob(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    console.log(`🔄 Processing render job: ${jobId}`);
    
    const stages = job.stages;
    const stageOrder = ['extraction', 'audio', 'text', 'visual', 'application'];
    
    for (let i = 0; i < stageOrder.length; i++) {
      if (job.status === 'cancelled') return;
      
      const stageId = stageOrder[i];
      const stageIndex = stages.findIndex((s: any) => s.id === stageId);
      
      if (stageIndex >= 0) {
        // Update job status
        job.status = 'processing';
        job.currentStage = stageId;
        stages[stageIndex].status = 'processing';
        
        // Simulate stage progress
        for (let progress = 0; progress <= 100; progress += 15) {
          if (job.status === 'cancelled') return;
          
          stages[stageIndex].progress = progress;
          job.progress = ((i * 100 + progress) / (stageOrder.length * 100)) * 100;
          
          await new Promise(resolve => setTimeout(resolve, 400));
        }
        
        stages[stageIndex].status = 'completed';
      }
    }
    
    // Complete job
    job.status = 'completed';
    job.progress = 100;
    job.completedAt = new Date();
    job.resultUrl = `/api/placeholder/video-result.mp4`;
    job.downloadUrl = `/api/download/${jobId}`;
    job.metadata = {
      duration: '0:15',
      aspectRatio: '9:16',
      fileSize: '2.4 MB',
      effects: 5,
      textOverlays: 3
    };
    
    console.log(`✅ Render job completed: ${jobId}`);
  }

  async close() {
    console.log('📋 Simple Queue Service closed');
    return Promise.resolve();
  }
}