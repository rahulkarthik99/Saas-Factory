'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/projects')
        .then(res => res.json())
        .then(data => setProjects(data.projects || []));
    }
  }, [status]);

  if (status === 'loading') {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <button
          onClick={() => router.push('/projects/new')}
          className="bg-[#00d4ff] hover:bg-[#00b3d6] text-black font-bold py-2 px-4 rounded transition-colors"
        >
          Generate New SaaS
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0f1419] border border-[#1f2d3d] p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-400 mb-2">Total Projects</h2>
          <p className="text-3xl font-bold text-white">{projects.length}</p>
        </div>
        <div className="bg-[#0f1419] border border-[#1f2d3d] p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-400 mb-2">Active Deployments</h2>
          <p className="text-3xl font-bold text-[#00ff9d]">
            {projects.filter((p: any) => p.status === 'DEPLOYED').length}
          </p>
        </div>
        <div className="bg-[#0f1419] border border-[#1f2d3d] p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-400 mb-2">Available Credits</h2>
          <p className="text-3xl font-bold text-[#a855f7]">
            {/* Will need real credits fetched */}
            {session?.user?.plan === 'PRO' ? 'Unlimited' : '10'}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Recent Projects</h2>
        <div className="bg-[#0f1419] border border-[#1f2d3d] rounded-lg shadow overflow-hidden">
          {projects.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No projects generated yet. Click &quot;Generate New SaaS&quot; to begin.
            </div>
          ) : (
            <ul className="divide-y divide-[#1f2d3d]">
              {projects.map((project: any) => (
                <li key={project.id} className="p-4 hover:bg-[#161d26] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-medium text-white">{project.name}</p>
                      <p className="text-sm text-gray-500">{project.description}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        project.status === 'DEPLOYED' ? 'bg-[#00ff9d]/10 text-[#00ff9d]' :
                        project.status === 'FAILED' ? 'bg-[#ff4757]/10 text-[#ff4757]' :
                        'bg-[#ffd32a]/10 text-[#ffd32a]'
                      }`}>
                        {project.status}
                      </span>
                      {project.url && (
                        <a href={`https://${project.url}`} target="_blank" rel="noopener noreferrer" className="text-sm text-[#00d4ff] hover:underline">
                          View Site
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
