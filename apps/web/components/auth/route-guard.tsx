'use client';

import React, { Suspense, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

const PROTECTED_PREFIXES = ['/dashboard', '/projects', '/tasks'];
const AUTH_ROUTES = ['/login', '/register'];

function RouteGuardWatcher({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Check preview bypass for design previewing if explicitly requested
    const isPreview =
      typeof window !== 'undefined' &&
      (window.location.search.includes('preview=true') ||
        localStorage.getItem('zmc_preview_mode') === 'true');

    if (isPreview) return;

    const isProtected = PROTECTED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );
    const isAuthRoute = AUTH_ROUTES.includes(pathname);

    if (isProtected && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (isAuthRoute && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  const isPreview =
    typeof window !== 'undefined' &&
    (window.location.search.includes('preview=true') ||
      localStorage.getItem('zmc_preview_mode') === 'true');

  if (isLoading && isProtected && !isPreview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfbf5]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-zinc-900 border-t-transparent animate-spin" />
          <p className="text-xs text-zinc-500 font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function RouteGuard({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <RouteGuardWatcher>{children}</RouteGuardWatcher>
    </Suspense>
  );
}
