import { Queue } from 'bullmq';
import IORedis from 'ioredis';

let buildQueue: Queue | null = null;

function getQueue() {
  if (buildQueue) return buildQueue;

  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

  // Only connect if not during Next.js build
  if (process.env.npm_lifecycle_event === 'build') {
    return null;
  }

  const redis = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    lazyConnect: true // Prevent immediate connection
  });

  // Don't auto-connect during imports
  buildQueue = new Queue('buildQueue', {
    connection: redis,
  });

  return buildQueue;
}

export async function addBuildJob(projectId: string, code: any) {
  try {
    const queue = getQueue();
    if (!queue) {
      console.log('Skipping job queue during build');
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
