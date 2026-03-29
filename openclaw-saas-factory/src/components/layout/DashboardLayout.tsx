'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { LayoutDashboard, Settings, Code, Zap, LogOut } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: Code },
    { name: 'Usage', href: '/usage', icon: Zap },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#080c10]">
      {/* Sidebar */}
      <div className="w-64 bg-[#0f1419] border-r border-[#1f2d3d] flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-[#1f2d3d]">
          <span className="text-xl font-bold text-[#00d4ff]">OpenClaw</span>
        </div>

        <div className="flex-1 py-4 overflow-y-auto">
          <nav className="px-3 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-[#1e2833] text-white'
                      : 'text-gray-400 hover:bg-[#161d26] hover:text-white'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-[#00d4ff]' : 'text-gray-500 group-hover:text-gray-300'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {session && (
          <div className="p-4 border-t border-[#1f2d3d]">
            <div className="flex items-center mb-4">
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{session.user?.name}</p>
                <p className="text-xs font-medium text-gray-500 truncate">{session.user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-400 hover:bg-[#161d26] rounded-md transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
