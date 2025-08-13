import { Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis.default(process.env.REDIS_URL || 'redis://localhost:6379');

export const worker = new Worker('skify-jobs', async job => {
  switch (job.name) {
    case 'analyze':
      // TODO: AI style extraction logic
      return { metadata: { style: 'mock' } };
    case 'export':
      // TODO: Video rendering logic
      return { url: 'https://cdn.skify.com/outputs/mock.mp4' };
    default:
      throw new Error('Unknown job type');
  }
}, { connection });
