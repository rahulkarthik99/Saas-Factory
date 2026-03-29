import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-[#080c10] text-[#e2eaf4]">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold mb-8">OpenClaw SaaS Factory</h1>
      </div>

      <div className="text-center mb-12 max-w-2xl">
        <p className="text-lg mb-6 text-gray-400">
          The ultimate AI-powered factory that generates, builds, and deploy complete SaaS applications in minutes.
          Includes authentication, payments, and full stack architecture.
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/dashboard" className="bg-[#00d4ff] text-black font-bold py-3 px-6 rounded-md hover:bg-opacity-80 transition-all">
            Start Building
          </Link>
          <Link href="/pricing" className="bg-transparent border border-[#1f2d3d] py-3 px-6 rounded-md hover:bg-[#161d26] transition-all">
            View Pricing
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 w-full max-w-5xl">
        <div className="p-6 border border-[#1f2d3d] rounded-lg bg-[#0f1419]">
          <h3 className="text-xl font-bold mb-3 text-[#00ff9d]">Generate Code</h3>
          <p className="text-gray-400">AI agents autonomously write real full-stack Next.js applications, not just UI components.</p>
        </div>
        <div className="p-6 border border-[#1f2d3d] rounded-lg bg-[#0f1419]">
          <h3 className="text-xl font-bold mb-3 text-[#ff7b35]">Build & Deploy</h3>
          <p className="text-gray-400">Automated job queues run builds and deploy directly to Vercel with zero manual configuration.</p>
        </div>
        <div className="p-6 border border-[#1f2d3d] rounded-lg bg-[#0f1419]">
          <h3 className="text-xl font-bold mb-3 text-[#a855f7]">Auth & Payments</h3>
          <p className="text-gray-400">Pre-integrated NextAuth and Stripe so you can start monetizing immediately.</p>
        </div>
      </div>
    </main>
  );
}
