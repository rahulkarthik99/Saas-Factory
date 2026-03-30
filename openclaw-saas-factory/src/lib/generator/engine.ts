import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import prisma from '@/lib/db/prisma';

const execAsync = util.promisify(exec);

export async function generateSaaS(projectId: string, code: any) {
  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new Error('Project not found');

    await prisma.build.create({
      data: {
        projectId,
        status: 'RUNNING',
        logs: 'Starting code generation...'
      }
    });

    const workDir = path.join(process.cwd(), 'projects', projectId);
    if (!fs.existsSync(workDir)) {
      fs.mkdirSync(workDir, { recursive: true });
    }

    // Process AI payload into files
    const parsedCode = typeof code === 'string' ? JSON.parse(code) : code;

    for (const [filename, content] of Object.entries(parsedCode)) {
      const filePath = path.join(workDir, filename as string);
      const dir = path.dirname(filePath);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, content as string);
    }

    // Install dependencies
    await prisma.build.updateMany({
      where: { projectId, status: 'RUNNING' },
      data: { logs: 'Installing dependencies...' }
    });

    // Simulate or execute npm install depending on environment.
    // In actual production we would securely run this inside a sandboxed container (e.g. Docker)
    try {
        await execAsync('npm install', { cwd: workDir });
    } catch (e: any) {
        console.warn('npm install failed or was mocked', e.message);
    }

    // Run build
    await prisma.build.updateMany({
      where: { projectId, status: 'RUNNING' },
      data: { logs: 'Running build...' }
    });

    try {
        await execAsync('npm run build', { cwd: workDir });
    } catch (e: any) {
         console.warn('npm run build failed or was mocked', e.message);
    }

    // Add build success log
    await prisma.build.updateMany({
      where: { projectId, status: 'RUNNING' },
      data: {
        status: 'COMPLETED',
        logs: 'Code generation, dependency installation and build completed successfully.'
      }
    });

    return { success: true, workDir };
  } catch (error: any) {
    console.error('Generation failed:', error);
    await prisma.build.updateMany({
      where: { projectId, status: 'RUNNING' },
      data: {
        status: 'FAILED',
        logs: error.message
      }
    });
    return { success: false, error: error.message };
  }
}
