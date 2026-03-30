import { validateEnv } from './lib/env';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Validate required environment variables at startup
    try {
        validateEnv();
    } catch (e: any) {
        console.error(e.message);
        // We only warn in instrumentation so NextJS static builds don't hard crash
        // if they don't supply tokens properly in CI.
        if (process.env.npm_lifecycle_event !== 'build') {
           throw e;
        }
    }

    const { startWorker } = await import('./queue/worker');
    startWorker();
  }
}
