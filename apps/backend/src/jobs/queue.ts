import { Queue } from 'bullmq';

import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
	const msg = 'FATAL: REDIS_URL environment variable is not set. Please configure a Redis instance and set REDIS_URL.';
	console.error(msg);
	throw new Error(msg);
}
const connection = new IORedis.default(redisUrl);

export const jobQueue = new Queue('skify-jobs', { connection });
