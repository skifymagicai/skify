import { Worker } from 'bullmq';

import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  const msg = 'FATAL: REDIS_URL environment variable is not set. Please configure a Redis instance and set REDIS_URL.';
  console.error(msg);
  throw new Error(msg);
}
const connection = new IORedis.default(redisUrl);

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
