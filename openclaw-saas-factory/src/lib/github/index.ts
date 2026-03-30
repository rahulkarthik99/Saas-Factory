import { Octokit } from '@octokit/rest';
import { exec } from 'child_process';
import util from 'util';
import prisma from '@/lib/db/prisma';

const execAsync = util.promisify(exec);

export async function createGithubRepo(name: string, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const token = user?.githubToken || process.env.GITHUB_PAT_TOKEN;

  if (!token) {
    throw new Error('User has not linked GitHub or provided a valid access token.');
  }

  const octokit = new Octokit({ auth: token });

  try {
    const response = await octokit.rest.repos.createForAuthenticatedUser({
      name,
      private: true,
      auto_init: false,
    });

    return {
      success: true,
      repoUrl: response.data.clone_url,
      repoName: response.data.full_name,
      owner: response.data.owner.login,
      token: token
    };
  } catch (error: any) {
    console.error('GitHub API error:', error);
    if (error.status === 422) {
         try {
           const { data: authUser } = await octokit.rest.users.getAuthenticated();
           const { data: repo } = await octokit.rest.repos.get({
               owner: authUser.login,
               repo: name
           });
           return {
              success: true,
              repoUrl: repo.clone_url,
              repoName: repo.full_name,
              owner: repo.owner.login,
              token: token
           }
         } catch(e) {}
    }
    return { success: false, error: error.message };
  }
}

export async function pushToGithub(workDir: string, repoName: string, owner: string, token: string) {
    const remoteUrl = `https://${owner}:${token}@github.com/${repoName}.git`;

    try {
        await execAsync(`git init`, { cwd: workDir });
        await execAsync(`git branch -M main`, { cwd: workDir });
        await execAsync(`git config user.email "bot@openclaw.ai"`, { cwd: workDir });
        await execAsync(`git config user.name "OpenClaw Bot"`, { cwd: workDir });

        await execAsync(`git add .`, { cwd: workDir });

        try {
            await execAsync(`git commit -m "Initial generation from OpenClaw Factory"`, { cwd: workDir });
        } catch (e: any) {
             if (!e.message.includes('nothing to commit')) {
                  throw e;
             }
        }

        try {
             await execAsync(`git remote add origin ${remoteUrl}`, { cwd: workDir });
        } catch(e) {
             await execAsync(`git remote set-url origin ${remoteUrl}`, { cwd: workDir });
        }

        await execAsync(`git push -u origin main --force`, { cwd: workDir });

        return { success: true };
    } catch (error: any) {
        console.error('Failed pushing to Github:', error);
        return { success: false, error: error.message };
    }
}
