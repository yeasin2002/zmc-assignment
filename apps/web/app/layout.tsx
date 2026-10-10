import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ZMC Tasks — Modern Project & Task Management',
  description:
    'Collaborate seamlessly, manage team projects, and track tasks with speed and precision.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn('h-full antialiased font-sans', inter.variable)}>
      <body className="min-h-full flex flex-col bg-[#fbfbf5] text-zinc-950 antialiased selection:bg-[#c1fbd4] selection:text-black">
        {children}
      </body>
    </html>
  );
}
