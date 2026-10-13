import React from 'react';
import Link from 'next/link';
import {
  IconCircleCheck,
  IconLayoutKanban,
  IconShieldCheck,
  IconSparkles,
} from '@tabler/icons-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex bg-white selection:bg-black selection:text-white">
      {/* Left / Main Column: Form Card */}
      <div className="flex-1 flex flex-col justify-between px-4 sm:px-8 py-8 md:py-12 max-w-xl mx-auto w-full">
        {/* Brand Header */}
        <header className="flex items-center justify-between w-full">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-md bg-black flex items-center justify-center text-white shadow-2xs transition-transform group-hover:scale-105">
              <IconLayoutKanban className="h-4 w-4" size={18} />
            </div>
            <div>
              <span className="font-heading font-bold text-sm tracking-tight text-black block leading-tight">
                ZMC Tasks
              </span>
              <span className="text-xs font-mono font-medium text-zinc-500 block tracking-wide uppercase">
                Project System
              </span>
            </div>
          </Link>
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 text-black text-xs font-medium border border-zinc-200">
            <IconShieldCheck className="h-3.5 w-3.5 text-black" size={14} />
            <span>Secure Access</span>
          </div>
        </header>

        {/* Main Card Container */}
        <main className="my-auto py-8 w-full flex justify-center">
          <div className="w-full max-w-md bg-white rounded-lg border border-zinc-200 p-8 sm:p-10 shadow-xs">
            {children}
          </div>
        </main>

        {/* Auth Footer */}
        <footer className="text-center text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-zinc-200 pt-6">
          <span>&copy; 2026 ZMC Tasks. All rights reserved.</span>
          <div className="flex items-center gap-4 text-zinc-500">
            <span className="inline-flex items-center gap-1.5 text-zinc-700">
              <span className="h-1.5 w-1.5 rounded-full bg-black"></span>
              All Systems Operational
            </span>
          </div>
        </footer>
      </div>

      {/* Right Column: Solid Minimal Product Showcase (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 p-4">
        <div className="w-full h-full rounded-lg bg-black text-white p-12 xl:p-16 flex flex-col justify-between relative overflow-hidden border border-zinc-800">
          {/* Top Tag */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900 text-white text-xs font-mono font-medium tracking-wide uppercase border border-zinc-800">
              <IconSparkles className="h-3.5 w-3.5 text-white" size={14} />
              <span>Project & Workload Orchestration</span>
            </div>
          </div>

          {/* Middle: Feature Highlights & Mock Card */}
          <div className="relative z-10 space-y-8 my-auto">
            <div className="space-y-4">
              <h2 className="text-3xl xl:text-4xl font-heading font-semibold tracking-tight text-white leading-tight">
                Clarity and momentum for ambitious teams.
              </h2>
              <p className="text-zinc-400 text-sm xl:text-base leading-relaxed max-w-lg">
                Plan sprints, track deliverables, and coordinate cross-functional teams in one
                unified, high-performance workspace.
              </p>
            </div>

            {/* Mock Task Card Preview */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-5 shadow-2xl max-w-md space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-medium text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
                  Sprint 14 • In Flight
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-900 text-white border border-zinc-700 font-medium">
                  High Priority
                </span>
              </div>
              <div>
                <h4 className="text-base font-heading font-medium text-white">Product Launch & Platform Milestone</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Coordinate cross-functional tasks, track milestones, and maintain velocity.
                </p>
              </div>
              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <IconCircleCheck className="h-4 w-4 text-white" size={16} />
                  8 of 12 tasks completed
                </span>
                <span className="bg-zinc-900 text-zinc-300 px-2 py-0.5 rounded-md text-xs font-mono">
                  Team Space
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Footnote */}
          <div className="relative z-10 pt-6 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span>Enterprise-grade security</span>
            <span>99.9% Uptime SLA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
