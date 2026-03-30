import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      {/* // HERO_SECTION */}
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold mb-8">Generated SaaS Application</h1>
      </div>

      <div className="text-center mb-12 max-w-2xl">
        <p className="text-lg mb-6 text-gray-400">
          This is a newly deployed base template. Customize this landing page or log in.
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/dashboard" className="bg-blue-600 text-white font-bold py-3 px-6 rounded-md hover:bg-blue-700 transition-all">
            Go to Dashboard
          </Link>
          <Link href="/pricing" className="bg-transparent border border-gray-700 py-3 px-6 rounded-md hover:bg-gray-800 transition-all">
            View Pricing
          </Link>
        </div>
      </div>

      {/* // FEATURES_SECTION */}
    </main>
  );
}
