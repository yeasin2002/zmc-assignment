'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  IconFolders,
  IconLayoutDashboard,
  IconLayoutKanban,
  IconLogout,
  IconMenu2,
  IconX,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth-context';

function HeaderContent() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200 px-4 sm:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Brand & Desktop Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/projects" className="inline-flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-md bg-black flex items-center justify-center text-white shadow-2xs transition-transform group-hover:scale-105">
              <IconLayoutKanban className="h-4 w-4" size={18} />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-sm tracking-tight text-black">
                ZMC Tasks
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 text-black border border-zinc-200">
                Workspace
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/projects"
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors ${
                isProjectsActive
                  ? 'font-semibold text-black bg-zinc-100'
                  : 'font-medium text-zinc-600 hover:text-black hover:bg-zinc-50'
              }`}
            >
              <IconFolders className="h-3.5 w-3.5" size={15} />
              <span>Projects</span>
            </Link>
            <Link
              href="/dashboard"
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors ${
                isDashboardActive
                  ? 'font-semibold text-black bg-zinc-100'
                  : 'font-medium text-zinc-600 hover:text-black hover:bg-zinc-50'
              }`}
            >
              <IconLayoutDashboard className="h-3.5 w-3.5" size={15} />
              <span>Dashboard</span>
            </Link>
          </nav>
        </div>

        {/* Right: User Profile, Actions & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3 py-1.5 rounded-md bg-white border border-zinc-200 text-xs text-zinc-800">
            <div className="h-5 w-5 rounded-sm bg-black text-white text-[10px] font-mono font-bold flex items-center justify-center">
              {initials}
            </div>
            <span className="font-medium text-black max-w-[100px] sm:max-w-[130px] truncate">
              {user?.name || 'Workspace User'}
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-wider text-black bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">
              Active
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sign out"
            title="Sign out"
            className="hidden sm:inline-flex items-center justify-center h-8 w-8 rounded-md border border-zinc-200 bg-white text-zinc-600 hover:text-black hover:border-black transition-colors shadow-2xs cursor-pointer"
          >
            <IconLogout className="h-4 w-4" size={16} />
          </button>

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle mobile navigation menu"
            className="inline-flex md:hidden items-center justify-center h-8 w-8 rounded-md border border-zinc-200 bg-white text-black hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? (
              <IconX className="h-4 w-4" size={18} />
            ) : (
              <IconMenu2 className="h-4 w-4" size={18} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-100 mt-3 pt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <Link
            href="/projects"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
              isProjectsActive
                ? 'font-semibold text-black bg-zinc-100'
                : 'text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <IconFolders className="h-4 w-4 text-zinc-500" size={18} />
            <span>Projects Workspaces</span>
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
              isDashboardActive
                ? 'font-semibold text-black bg-zinc-100'
                : 'text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <IconLayoutDashboard className="h-4 w-4 text-zinc-500" size={18} />
            <span>Workspace Dashboard</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <IconLogout className="h-4 w-4 text-red-500" size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
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
