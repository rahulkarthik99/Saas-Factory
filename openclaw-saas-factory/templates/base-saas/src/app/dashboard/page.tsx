'use client';

import React from 'react';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col p-4">
        <h2 className="text-xl font-bold mb-8">Dashboard</h2>
        <nav className="flex-1 space-y-2">
          <Link href="/dashboard" className="block p-2 rounded bg-gray-700 text-white">Home</Link>
          <Link href="/settings" className="block p-2 rounded text-gray-400 hover:bg-gray-700">Settings</Link>
        </nav>
      </div>
      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Welcome back</h1>
        <div className="p-6 bg-gray-800 rounded-lg shadow-sm border border-gray-700">
          <p className="text-gray-300">This is a protected dashboard area placeholder.</p>
          {/* // DASHBOARD_CONTENT */}
        </div>
      </div>
    </div>
  );
}
