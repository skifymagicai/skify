import { Queue, Worker, QueueEvents } from 'bullmq';
import Redis from 'ioredis';

// Redis connection setup
const redisConfig = process.env.REDIS_URL && process.env.REDIS_URL.startsWith('redis://') 
  ? { 
      port: 6379,
      host: 'localhost'
    }
  : process.env.REDIS_URL 
    ? {
        host: process.env.REDIS_URL.replace('https://', '').replace('http://', ''),
        port: 443,
        password: process.env.REDIS_TOKEN,
        tls: {}
      }
    : {
        port: 6379,
        host: 'localhost'
      };

// Lazy Redis connection - only connect when needed
let redis = null;
let redisInitialized = false;

function getRedisConnection() {
  if (!redisInitialized) {
    try {
      // Only create connection if Redis URL is properly configured
      if (process.env.REDIS_URL && process.env.REDIS_URL !== 'redis://localhost:6379') {
        redis = new Redis({
          ...redisConfig,
          lazyConnect: true,
          maxRetriesPerRequest: 3,
          retryDelayOnFailover: 100,
          connectTimeout: 5000
        });
        console.log('✅ Redis connection created (lazy)');
      } else {
        console.log('⚠️ Redis not configured, using null connection');
        redis = null;
      }
      redisInitialized = true;
    } catch (error) {
      console.warn('Redis connection setup failed:', error.message);
      redis = null;
      redisInitialized = true;
    }
  }
  return redis;
}

export const redis = getRedisConnection();

// Job queues - only create if Redis is available
function createMockQueue(name) {
  return {
    add: async (jobName, data, options) => {
      const jobId = `mock-${name}-${Date.now()}`;
      console.log(`Mock Queue ${name}: Added job ${jobId}`);
      return { id: jobId };
    },
    getJob: async (jobId) => ({ id: jobId, data: {}, progress: 100 })
  };
}

export const videoAnalysisQueue = redis ? 
  new Queue('video-analysis', {
    connection: redisConfig,
    defaultJobOptions: {
      removeOnComplete: 10,
      removeOnFail: 5,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    },
  }) : createMockQueue('video-analysis');

export const templateApplicationQueue = redis ?
  new Queue('template-application', {
    connection: redisConfig,
    defaultJobOptions: {
      removeOnComplete: 10,
      removeOnFail: 5,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    },
  }) : createMockQueue('template-application');

// Queue events for monitoring - only if Redis available
export const videoAnalysisQueueEvents = redis ? new QueueEvents('video-analysis', {
  connection: redisConfig,
}) : null;

export const templateApplicationQueueEvents = redis ? new QueueEvents('template-application', {
  connection: redisConfig,
}) : null;

// Cache utilities
export class RedisCache {
  static async get(key) {
    if (!redis) {
      console.log('RedisCache: No Redis connection, returning null');
      return null;
    }
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Redis get error:', error.message);
      return null;
    }
  }

  static async set(key, value, ttlSeconds = 3600) {
    if (!redis) {
      console.log('RedisCache: No Redis connection, skipping set operation');
      return false;
    }
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn('Redis set error:', error.message);
      return false;
    }
  }

  static async del(key) {
    if (!redis) {
      console.log('RedisCache: No Redis connection, skipping delete operation');
      return false;
    }
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.warn('Redis del error:', error.message);
      return false;
    }
  }

  static async exists(key) {
    if (!redis) {
      console.log('RedisCache: No Redis connection, returning false');
      return false;
    }
    try {
      return await redis.exists(key);
    } catch (error) {
      console.warn('Redis exists error:', error.message);
      return false;
    }
  }
}