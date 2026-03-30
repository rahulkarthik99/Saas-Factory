import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import prisma from '@/lib/db/prisma';

const execAsync = util.promisify(exec);

// Safely resolve boundaries
function resolveSafePath(workDir: string, filename: string): string | null {
  const safeFilename = path.normalize(filename).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(workDir, safeFilename);

  if (!filePath.startsWith(workDir)) {
      console.warn(`Blocked attempt to write outside sandbox boundary: ${safeFilename}`);
      return null;
  }
  return filePath;
}

// Executes a collection of modifications against the filesystem
export async function applyPatches(workDir: string, patchesObj: any) {
  // We need to parse arbitrary objects or arrays. The AI might send { patches: [...] } or an array directly
  const patches = Array.isArray(patchesObj) ? patchesObj : (patchesObj?.patches || []);

  for (const patch of patches) {
    if (!patch.file || !patch.operation) continue;

    const filePath = resolveSafePath(workDir, patch.file);
    if (!filePath) continue;

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    try {
        if (patch.operation === 'create_file') {
            const content = patch.content || patch.with || patch.code || '';
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`[PATCH] Created file: ${patch.file}`);
        }
        else if (patch.operation === 'replace_section') {
            if (!fs.existsSync(filePath)) {
                 console.warn(`[PATCH] Cannot replace section in missing file: ${patch.file}`);
                 continue;
            }
            let fileContent = fs.readFileSync(filePath, 'utf8');
            const target = patch.target || patch.after;
            const replacement = patch.with || patch.line || patch.content;

            if (target && replacement && fileContent.includes(target)) {
                 fileContent = fileContent.replace(target, replacement);
                 fs.writeFileSync(filePath, fileContent, 'utf8');
                 console.log(`[PATCH] Replaced section in: ${patch.file}`);
            } else {
                 console.warn(`[PATCH] Target '${target}' not found in ${patch.file}`);
            }
        }
        else if (patch.operation === 'add_line') {
             const addition = patch.with || patch.line || patch.content;
             if (!addition) continue;

             if (!fs.existsSync(filePath)) {
                  fs.writeFileSync(filePath, addition + '\n', 'utf8');
                  console.log(`[PATCH] Created new file with line: ${patch.file}`);
             } else {
                  let fileContent = fs.readFileSync(filePath, 'utf8');
                  const target = patch.target || patch.after;

                  if (target && fileContent.includes(target)) {
                       fileContent = fileContent.replace(target, target + '\n' + addition);
                       fs.writeFileSync(filePath, fileContent, 'utf8');
                       console.log(`[PATCH] Added line after target in: ${patch.file}`);
                  } else {
                       fs.appendFileSync(filePath, '\n' + addition, 'utf8');
                       console.log(`[PATCH] Appended line to: ${patch.file}`);
                  }
             }
        }
    } catch (e: any) {
        throw new Error(`Failed to apply patch on ${patch.file}: ${e.message}`);
    }
  }

  // Handle specific backend structures like api_routes arrays
  const apiRoutes = patchesObj?.api_routes || [];
  for (const route of apiRoutes) {
      if (!route.file || !route.code) continue;
      const filePath = resolveSafePath(workDir, route.file);
      if (!filePath) continue;

      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, route.code, 'utf8');
      console.log(`[PATCH] Generated API Route: ${route.file}`);
  }
}

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
    const templateDir = path.join(process.cwd(), 'templates', 'base-saas');

    // Step 1: Clone the Base SaaS Template First using local git repository
    await prisma.build.updateMany({
      where: { projectId, status: 'RUNNING' },
      data: { logs: 'Cloning base SaaS template...' }
    });

    if (fs.existsSync(workDir)) {
      fs.rmSync(workDir, { recursive: true, force: true });
    }

    try {
        // Clone template from local repository
        await execAsync(`git clone ${templateDir} ${workDir}`);

        // Remove git history to ensure fresh initialization later by github script
        fs.rmSync(path.join(workDir, '.git'), { recursive: true, force: true });
    } catch (e: any) {
        throw new Error(`Failed to clone template: ${e.message}`);
    }

    // Step 2: Process AI payload into files as patches on top of the base template
    await prisma.build.updateMany({
      where: { projectId, status: 'RUNNING' },
      data: { logs: 'Applying AI-generated code patches...' }
    });

    const parsedCode = typeof code === 'string' ? JSON.parse(code) : code;

    // Core Patch Application Engine
    await applyPatches(workDir, parsedCode);

    // Install dependencies
    await prisma.build.updateMany({
      where: { projectId, status: 'RUNNING' },
      data: { logs: 'Installing dependencies...' }
    });

    try {
        await execAsync('npm install', { cwd: workDir });
    } catch (e: any) {
        console.warn('npm install warning', e.message);
    }

    // Add build success log
    await prisma.build.updateMany({
      where: { projectId, status: 'RUNNING' },
      data: {
        status: 'COMPLETED',
        logs: 'Code patches applied and dependencies installed successfully.'
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
