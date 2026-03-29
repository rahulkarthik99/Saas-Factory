# OpenClaw SaaS Factory

The ultimate AI-powered factory that generates, builds, and deploys complete SaaS applications in minutes.
This repository acts as a real-world pipeline handling authentication, database schema, payment gateways, and intelligent job queues using Redis.

## Features

- **Full Stack Applications**: Built with Next.js 14, TailwindCSS, and Prisma.
- **Job Queues**: Uses BullMQ + Redis to asynchronously handle long-running code generation and deployments.
- **Monetization & Auth**: Built-in support for NextAuth and Stripe (Subscription & Free-Tier limits).
- **Auto-Deploy**: Simulates push to Vercel/similar hosting after file generation is complete.

## Setup Instructions

### Requirements
- Node.js 18+
- Redis running locally (or hosted equivalent)

### Installation
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Copy the `.env.example` file to a new `.env` file and populate your tokens:
   ```bash
   cp .env.example .env
   ```
3. Run Prisma schema generation and push it to SQLite:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
4. Start a local Redis instance on port 6379 for the build queue:
   ```bash
   redis-server &
   ```
5. Build and Start the application:
   ```bash
   npm run build
   npm start &
   ```
