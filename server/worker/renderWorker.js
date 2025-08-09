const { Worker } = require('bullmq');
const Redis = require('ioredis');
const path = require('path');
const fs = require('fs').promises;

// Redis connection
let redis = null;

if (process.env.REDIS_URL && !process.env.DISABLE_UPSTASH_AUTOCREATE) {
  redis = new Redis(process.env.REDIS_URL);
} else if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    host: process.env.UPSTASH_REDIS_REST_URL.replace('https://', '').replace('http://', ''),
    port: 6379,
    password: process.env.UPSTASH_REDIS_REST_TOKEN,
    tls: process.env.UPSTASH_REDIS_REST_URL.startsWith('https') ? {} : undefined
  });
}

// Render worker
const renderWorker = redis ? new Worker('render', async (job) => {
  console.log(`Processing render job: ${job.id}`);
  const { templateId, videoUrl, userId, userTier, options } = job.data;
  
  try {
    // Update progress
    await job.updateProgress(10);
    
    // Simulate video processing stages
    console.log('📹 Downloading video...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await job.updateProgress(25);
    
    console.log('🎨 Applying template...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    await job.updateProgress(50);
    
    console.log('🔧 Processing effects...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await job.updateProgress(75);
    
    console.log('📤 Exporting video...');
    
    // Create output file (stubbed)
    const outputDir = path.join(__dirname, '../../storage/outputs');
    const filename = `render_${job.id}_${userTier === 'pro' ? '4k' : '720p'}.mp4`;
    const outputPath = path.join(outputDir, filename);
    
    // Create dummy output file
    await fs.writeFile(outputPath, 'dummy video content');
    
    await job.updateProgress(90);
    
    // Add watermark for free tier
    if (userTier === 'free') {
      console.log('🏷️ Adding watermark...');
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    await job.updateProgress(100);
    
    console.log(`✅ Job ${job.id} completed successfully`);
    
    return {
      success: true,
      resultUrl: `/api/files/${filename}`,
      resolution: userTier === 'pro' ? '4K' : '720p',
      watermark: userTier === 'free',
      processingTime: Date.now() - job.timestamp
    };
    
  } catch (error) {
    console.error(`❌ Job ${job.id} failed:`, error);
    throw error;
  }
}, { connection: redis }) : null;

if (renderWorker) {
  renderWorker.on('completed', (job, result) => {
    console.log(`Job ${job.id} completed:`, result);
  });
  
  renderWorker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed:`, err);
  });
  
  console.log('🔄 Render worker started');
} else {
  console.log('⚠️  Render worker not started (Redis not available)');
}

module.exports = renderWorker;