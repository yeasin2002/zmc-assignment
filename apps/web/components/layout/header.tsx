'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  IconFolders,
  IconLayoutDashboard,
  IconLayoutKanban,
  IconLogout,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth-context';

function HeaderContent() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    router.replace('/login');
  };

  const isProjectsActive = pathname === '/projects' || pathname.startsWith('/projects/');
  const isDashboardActive = pathname === '/dashboard' || pathname.startsWith('/dashboard/');

  const initials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  return (
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
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs transition-colors ${
                isProjectsActive
                  ? 'font-semibold text-zinc-900 bg-zinc-100/90'
                  : 'font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/60'
              }`}
            >
              <IconFolders className="h-3.5 w-3.5" size={15} />
              <span>Projects</span>
            </Link>
            <Link
              href="/dashboard"
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs transition-colors ${
                isDashboardActive
                  ? 'font-semibold text-zinc-900 bg-zinc-100/90'
                  : 'font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/60'
              }`}
            >
              <IconLayoutDashboard className="h-3.5 w-3.5" size={15} />
              <span>Dashboard</span>
            </Link>
          </nav>
        </div>

        {/* Right: User Profile & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-200/60 text-xs text-zinc-700">
            <div className="h-5 w-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
              {initials}
            </div>
            <span className="font-medium text-zinc-800 max-w-[130px] truncate">
              {user?.name || 'Workspace User'}
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-semibold tracking-wider text-emerald-800 bg-[#c1fbd4] px-1.5 py-0.5 rounded-md">
              Active
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sign out"
            title="Sign out"
            className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-zinc-200/80 bg-white text-zinc-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 transition-colors shadow-xs cursor-pointer"
          >
            <IconLogout className="h-4 w-4" size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

export function Header() {
  return (
    <Suspense
      fallback={
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 px-4 sm:px-8 py-3.5 h-[61px]" />
      }
    >
      <HeaderContent />
    </Suspense>
  );
}
