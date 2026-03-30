export function validateEnv() {
  const required = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'GITHUB_PAT_TOKEN',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`CRITICAL: Missing required environment variables:\n${missing.join('\n')}\nPlease check your .env file.`);
  }

  // Warn about missing optional/production env variables
  const optional = [
    'VERCEL_TOKEN',
    'REDIS_URL',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
  ];

  const missingOptional = optional.filter((key) => !process.env[key]);
  if (missingOptional.length > 0) {
    console.warn(`WARNING: Missing optional environment variables. Some features may be disabled:\n${missingOptional.join('\n')}`);
  }
}
