import React from 'react';
import { Header } from '@/components/layout/header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fbfbf5] flex flex-col text-zinc-900 selection:bg-[#c1fbd4] selection:text-black">
      {/* Top Navigation Bar */}
      <Header />

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
