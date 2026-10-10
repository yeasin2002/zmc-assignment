import React from 'react';
import Link from 'next/link';
import {
  IconFolders,
  IconLayoutDashboard,
  IconLayoutKanban,
  IconLogout,
} from '@tabler/icons-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fbfbf5] flex flex-col text-zinc-900 selection:bg-[#c1fbd4] selection:text-black">
      {/* Top Navigation Bar (nav-bar-light as specified in DESIGN.md) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Brand & Main Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/projects" className="inline-flex items-center gap-2.5 group">
              <div className="h-8 w-8 rounded-xl bg-black flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
                <IconLayoutKanban className="h-4 w-4" size={18} />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm tracking-tight text-zinc-900">
                  ZMC Tasks
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#c1fbd4] text-zinc-900">
                  Workspace
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-zinc-900 bg-zinc-100/90 transition-colors"
              >
                <IconFolders className="h-3.5 w-3.5" size={15} />
                <span>Projects</span>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/60 transition-colors"
              >
                <IconLayoutDashboard className="h-3.5 w-3.5" size={15} />
                <span>Dashboard</span>
              </Link>
            </nav>
          </div>

          {/* Right: User Profile & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-200/60 text-xs text-zinc-700">
              <div className="h-5 w-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                O
              </div>
              <span className="font-medium text-zinc-800">Owner User</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-800 bg-[#c1fbd4] px-1.5 py-0.5 rounded-md">
                Admin
              </span>
            </div>

            <Link
              href="/login"
              aria-label="Sign out"
              className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-zinc-200/80 bg-white text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 transition-colors shadow-xs"
            >
              <IconLogout className="h-4 w-4" size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200/60 bg-white/60 py-6 px-4 sm:px-8 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 ZMC Tasks. All rights reserved.</span>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-zinc-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              All Systems Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
