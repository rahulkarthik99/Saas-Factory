import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { generateSaaS } from '../lib/generator/engine';
import { deployToVercel } from '../lib/deploy/vercel';
import prisma from '../lib/db/prisma';

export function startWorker() {
    if (process.env.npm_lifecycle_event === 'build') {
        return null;
    }

    const redis = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
        maxRetriesPerRequest: null,
        lazyConnect: true // Prevent immediate connection
    });

    const buildWorker = new Worker(
      'buildQueue',
      async (job) => {
        const { projectId, code } = job.data;

        await prisma.project.update({
          where: { id: projectId },
          data: { status: 'BUILDING' }
        });

        try {
          console.log(`Building project ${projectId}`);
          const buildResult = await generateSaaS(projectId, code);

          if (!buildResult.success || !buildResult.workDir) {
            throw new Error(buildResult.error || 'Failed to generate SaaS');
          }

          await prisma.project.update({
            where: { id: projectId },
            data: { status: 'DEPLOYING' }
          });

          console.log(`Deploying project ${projectId}`);
          const deployResult = await deployToVercel(projectId, buildResult.workDir);

          if (!deployResult.success) {
            throw new Error(deployResult.error || 'Failed to deploy to Vercel');
          }

          console.log(`Successfully built and deployed project ${projectId}`);
        } catch (error: any) {
          console.error(`Error processing job ${job.id}:`, error);
          await prisma.project.update({
            where: { id: projectId },
            data: { status: 'FAILED' }
          });
          throw error;
        }
      },
      {
        connection: redis,
        settings: {
          backoffStrategies: {
            jitter: function (attemptsMade: number, err: Error) {
              return 5000 + Math.random() * 500;
            }
          }
        }
      }
    );

    buildWorker.on('completed', (job) => {
      console.log(`${job.id} has completed!`);
    });

    buildWorker.on('failed', (job, err) => {
      console.log(`${job?.id} has failed with ${err.message}`);
    });

    return buildWorker;
}

// Don't auto-start the worker in root context
// startWorker();
