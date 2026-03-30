import { Queue } from 'bullmq';
import IORedis from 'ioredis';

let buildQueue: Queue | null = null;

export function getQueue() {
  if (buildQueue) return buildQueue;

  const redisUrl = process.env.REDIS_URL;

  // Only connect if REDIS_URL exists and not during Next.js build
  if (!redisUrl || process.env.npm_lifecycle_event === 'build') {
    if (!redisUrl && process.env.npm_lifecycle_event !== 'build') {
      console.warn('⚠️ Redis disabled: REDIS_URL not set in environment.');
    }
    return null;
  }

  const redis = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    lazyConnect: true,
    retryStrategy(times) {
      if (times > 3) {
         console.warn('⚠️ Redis connection failed. Retries disabled.');
         return null; // Stop retrying after 3 attempts
      }
      return Math.min(times * 50, 2000);
    }
  });

  redis.on('error', (err) => {
    // Suppress verbose ECONNREFUSED error spam safely without crashing
    if (err.code === 'ECONNREFUSED') {
       console.warn(`⚠️ Redis disabled (ECONNREFUSED) on ${err.address}:${err.port}`);
    } else {
       console.error('Redis error:', err.message);
    }
  });

  buildQueue = new Queue('buildQueue', {
    connection: redis,
  });

  return buildQueue;
}

export async function addBuildJob(projectId: string, code: any) {
  try {
    const queue = getQueue();
    if (!queue) {
      console.warn('⚠️ Skipping job queue: Redis is not configured or disabled.');
      return false;
    }
    await queue.add('build', { projectId, code });
    console.log(`Added build job for project ${projectId}`);
    return true;
  } catch (error) {
    console.error(`Error adding build job for project ${projectId}:`, error);
    return false;
  }
}
