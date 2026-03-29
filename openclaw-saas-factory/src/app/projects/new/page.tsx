'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import axios from 'axios';

export default function NewProject() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In a real app, this is where we'd call the AI to generate the code first
      // For now, we simulate code generation for demonstration purposes
      const mockCode = {
        'package.json': JSON.stringify({ name: formData.name, version: '1.0.0' }),
        'src/index.js': 'console.log("Hello, World!");'
      };

      const res = await axios.post('/api/projects', {
        name: formData.name,
        description: formData.description,
        code: mockCode
      });

      if(res.data) {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Generate New SaaS</h1>

        <form onSubmit={handleSubmit} className="bg-[#0f1419] border border-[#1f2d3d] rounded-lg p-6 shadow-sm">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                Project Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-[#1f2d3d] bg-[#161d26] text-white shadow-sm focus:border-[#00d4ff] focus:ring-[#00d4ff] sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                Description & Requirements
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-[#1f2d3d] bg-[#161d26] text-white shadow-sm focus:border-[#00d4ff] focus:ring-[#00d4ff] sm:text-sm"
                placeholder="Describe your SaaS idea in detail..."
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="bg-transparent border border-[#1f2d3d] py-2 px-4 rounded-md hover:bg-[#161d26] transition-all mr-4 text-white font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00d4ff]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-black bg-[#00d4ff] hover:bg-[#00b3d6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00d4ff] disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Code'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
