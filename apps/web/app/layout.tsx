import type { Metadata } from 'next';
import '@fontsource-variable/plus-jakarta-sans';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { QueryProvider } from '@/components/providers/query-provider';
import { AuthProvider } from '@/context/auth-context';
import { RouteGuard } from '@/components/auth/route-guard';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'ZMC Tasks — Modern Project & Task Management',
  description:
    'Collaborate seamlessly, manage team projects, and track tasks with speed and precision.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        'h-full antialiased',
        GeistSans.variable,
        GeistMono.variable,
      )}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-white text-black font-sans antialiased selection:bg-black selection:text-white"
      >
        <QueryProvider>
          <AuthProvider>
            <RouteGuard>{children}</RouteGuard>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
