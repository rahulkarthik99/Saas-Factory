import axios from 'axios';
import prisma from '@/lib/db/prisma';
import util from 'util';
import { exec } from 'child_process';
const execAsync = util.promisify(exec);

export async function deployToVercel(projectId: string, repoId: string, repoOwner: string, gitProvider: string = 'github') {
  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new Error('Project not found');

    const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
    const TEAM_ID = process.env.VERCEL_TEAM_ID;

    if (!VERCEL_TOKEN) throw new Error('VERCEL_TOKEN is required for real deployments');

    const headers = {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    };

    const queryStr = TEAM_ID ? `?teamId=${TEAM_ID}` : '';
    const projectName = `oc-${projectId.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 48)}`;

    // Create a Project on Vercel linked to the repository with secure per-project Env Vars
    const createProjectRes = await axios.post(`https://api.vercel.com/v9/projects${queryStr}`, {
      name: projectName,
      framework: 'nextjs',
      gitRepository: {
        type: gitProvider,
        repo: repoId,
      },
      environmentVariables: [
        {
          key: 'DATABASE_URL',
          value: project.dbUrl || 'file:./dev.db',
          type: 'plain',
          target: ['production', 'preview', 'development'],
        },
        {
          key: 'NEXTAUTH_SECRET',
          value: project.nextAuthSecret || Math.random().toString(36).substring(2, 15),
          type: 'plain',
          target: ['production', 'preview', 'development'],
        },
        {
          key: 'STRIPE_SECRET_KEY',
          value: project.stripeSecret || 'sk_test_123',
          type: 'plain',
          target: ['production', 'preview', 'development'],
        }
      ]
    }, { headers });

    const vercelProjectId = createProjectRes.data.id;

    const createDeployRes = await axios.post(`https://api.vercel.com/v13/deployments${queryStr}`, {
      name: projectName,
      project: vercelProjectId,
      gitSource: {
        type: gitProvider,
        repoId: repoId,
        ref: 'main'
      }
    }, { headers });

    const deploymentUrl = createDeployRes.data.url;
    const productionUrl = `https://${deploymentUrl}`;

    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'DEPLOYED',
        url: productionUrl,
        vercelId: vercelProjectId,
      }
    });

    return { success: true, url: productionUrl };
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || error.message;
    console.error('Deployment failed:', errorMessage);

    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'FAILED',
      }
    });
    return { success: false, error: errorMessage };
  }
}
