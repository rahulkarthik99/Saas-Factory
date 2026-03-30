'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Code2 } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c10] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-md w-full space-y-8 bg-[#0f1419] p-8 border border-[#1f2d3d] rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Or{' '}
            <Link href="/register" className="font-medium text-[#00d4ff] hover:text-[#00b3d6]">
              create a new account
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-md text-sm text-center">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Email address</label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-md border-[#1f2d3d] bg-[#161d26] text-white shadow-sm focus:border-[#00d4ff] focus:ring-[#00d4ff] sm:text-sm p-2.5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Password</label>
              <input
                type="password"
                required
                className="mt-1 block w-full rounded-md border-[#1f2d3d] bg-[#161d26] text-white shadow-sm focus:border-[#00d4ff] focus:ring-[#00d4ff] sm:text-sm p-2.5"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-[#00d4ff] hover:bg-[#00b3d6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00d4ff] disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1f2d3d]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#0f1419] text-gray-400">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
              className="w-full inline-flex justify-center py-2.5 px-4 border border-[#1f2d3d] rounded-md shadow-sm bg-[#161d26] text-sm font-medium text-gray-300 hover:bg-[#1e2833] transition-colors"
            >
              <span className="sr-only">Sign in with GitHub</span>
              <Code2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-[#1f2d3d] rounded-md shadow-sm bg-[#161d26] text-sm font-medium text-gray-300 hover:bg-[#1e2833] transition-colors"
            >
              <span className="sr-only">Sign in with Google</span>
              Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
