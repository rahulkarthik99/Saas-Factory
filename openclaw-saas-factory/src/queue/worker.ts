import { createGithubRepo, pushToGithub } from '../lib/github/index';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { generateSaaS } from '../lib/generator/engine';
import { deployToVercel } from '../lib/deploy/vercel';
import prisma from '../lib/db/prisma';


export function startWorker() {
    if (process.env.npm_lifecycle_event === 'build') {
        return null;
    }

    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
       console.warn('⚠️ BullMQ Worker disabled: REDIS_URL not configured.');
       return null;
    }

    const redis = new IORedis(redisUrl, {
        maxRetriesPerRequest: null,
        lazyConnect: true,
        retryStrategy(times) {
          if (times > 3) return null;
          return Math.min(times * 50, 2000);
        }
    });

    redis.on('error', (err) => {
        if (err.code === 'ECONNREFUSED') {
           console.warn(`⚠️ BullMQ worker disabled (Redis ECONNREFUSED)`);
        }
    });

    const buildWorker = new Worker(
      'buildQueue',
      async (job) => {
        const { projectId, code } = job.data;

        const project = await prisma.project.update({
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
            data: { status: 'PUSHING' }
          });

          // GITHUB PIPELINE
          console.log(`Creating GitHub repo for project ${projectId}`);
          const repoDetails = await createGithubRepo(`oc-saas-${projectId}`, project.userId);

          if (!repoDetails.success || !repoDetails.token) {
            throw new Error(repoDetails.error || 'Failed to create GitHub repo');
          }

          console.log(`Pushing code to GitHub: ${repoDetails.repoName}`);
          const pushResult = await pushToGithub(buildResult.workDir, repoDetails.repoName, repoDetails.owner, repoDetails.token);

          if (!pushResult.success) {
              throw new Error(pushResult.error || 'Failed to push to GitHub');
          }

          await prisma.project.update({
            where: { id: projectId },
            data: {
                status: 'DEPLOYING',
                repository: repoDetails.repoUrl
            }
          });

          // VERCEL PIPELINE
          console.log(`Deploying project ${projectId} to Vercel via GitHub Repo ${repoDetails.repoName}`);
          const deployResult = await deployToVercel(projectId, repoDetails.repoName, repoDetails.owner);

          if (!deployResult.success) {
            throw new Error(deployResult.error || 'Failed to deploy to Vercel');
          }

          console.log(`Successfully built and deployed project ${projectId} at ${deployResult.url}`);
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
