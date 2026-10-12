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

  return <>{children}</>;
}

export function RouteGuard({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <RouteGuardWatcher>{children}</RouteGuardWatcher>
    </Suspense>
  );
}
