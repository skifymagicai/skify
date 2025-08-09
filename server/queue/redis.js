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

export const redis = new Redis(redisConfig);

// Job queues
export const videoAnalysisQueue = new Queue('video-analysis', {
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
});

export const templateApplicationQueue = new Queue('template-application', {
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
});

// Queue events for monitoring
export const videoAnalysisQueueEvents = new QueueEvents('video-analysis', {
  connection: redisConfig,
});

export const templateApplicationQueueEvents = new QueueEvents('template-application', {
  connection: redisConfig,
});

// Cache utilities
export class RedisCache {
  static async get(key) {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  static async set(key, value, ttlSeconds = 3600) {
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  }

  static async del(key) {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Redis del error:', error);
      return false;
    }
  }

  static async exists(key) {
    try {
      return await redis.exists(key);
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }
}