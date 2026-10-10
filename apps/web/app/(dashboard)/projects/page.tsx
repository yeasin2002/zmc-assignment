'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  IconArrowRight,
  IconChecklist,
  IconFolder,
  IconPlus,
  IconSearch,
  IconUsers,
} from '@tabler/icons-react';
import { RoleBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ProjectsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Static mock projects matching seed data
  const initialProjects = [
    {
      id: 'proj-alpha-001',
      name: 'Project Alpha',
      description:
        'Core platform infrastructure, access management, and multi-tenant task orchestration.',
      role: 'Owner' as const,
      ownerName: 'Owner User',
      memberCount: 3,
      totalTasks: 12,
      completedTasks: 8,
      updatedAt: 'Updated 2 hours ago',
    },
    {
      id: 'proj-beta-002',
      name: 'Project Beta',
      description:
        'Client application dashboard, real-time analytics aggregation, and user workflow review.',
      role: 'Member' as const,
      ownerName: 'Member User 1',
      memberCount: 2,
      totalTasks: 5,
      completedTasks: 3,
      updatedAt: 'Updated yesterday',
    },
  ];

  const filteredProjects = initialProjects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-zinc-950">
            Projects
          </h1>
          <p className="text-sm text-zinc-500 max-w-xl">
            Manage team workspaces, access controls, and collaborative deliverables.
          </p>
        </div>

        {/* Action Button */}
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <IconPlus className="h-4 w-4" size={16} />
          <span>New Project</span>
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
            <IconSearch className="h-4 w-4" size={16} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name or description..."
            className="w-full rounded-xl border border-zinc-200/90 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 transition-all outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>
            Showing {filteredProjects.length} of {initialProjects.length} projects
          </span>
        </div>
      </div>

      {/* Projects Grid or Empty State */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={IconFolder}
          title="No projects found"
          description={`No project matches the search query "${searchQuery}". Try a different keyword or create a new workspace.`}
          action={
            <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const completionPercentage = Math.round(
              (project.completedTasks / project.totalTasks) * 100,
            );

            return (
              <div
                key={project.id}
                className="bg-white rounded-2xl border border-zinc-200/80 p-6 flex flex-col justify-between hover:border-zinc-300 hover:shadow-xs transition-all group"
              >
                <div className="space-y-4">
                  {/* Card Top: Icon & Role Badge */}
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-800 group-hover:bg-[#c1fbd4] group-hover:text-zinc-900 transition-colors">
                      <IconFolder className="h-5 w-5" size={20} />
                    </div>
                    <RoleBadge role={project.role} />
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-medium text-zinc-900 group-hover:text-black transition-colors">
                      <Link href={`/projects/${project.id}`} className="hover:underline">
                        {project.name}
                      </Link>
                    </h3>
                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                </div>

                {/* Progress & Metadata */}
                <div className="space-y-4 pt-6 mt-6 border-t border-zinc-100">
                  {/* Task Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <IconChecklist className="h-3.5 w-3.5 text-zinc-400" size={14} />
                        <span>
                          {project.completedTasks}/{project.totalTasks} Tasks Completed
                        </span>
                      </span>
                      <span className="font-medium text-zinc-700">{completionPercentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Footer: Members & Open Link */}
                  <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
                    <span className="inline-flex items-center gap-1 text-zinc-600">
                      <IconUsers className="h-3.5 w-3.5 text-zinc-400" size={14} />
                      <span>{project.memberCount} members</span>
                    </span>

                    <Link
                      href={`/projects/${project.id}`}
                      className="inline-flex items-center gap-1 font-semibold text-zinc-900 hover:text-black transition-colors"
                    >
                      <span>Open</span>
                      <IconArrowRight className="h-3.5 w-3.5" size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Quick Create Prompt Card */}
          <div
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-2xl border-2 border-dashed border-zinc-200/90 p-6 flex flex-col items-center justify-center text-center space-y-3 bg-zinc-50/40 hover:bg-zinc-50/80 transition-colors cursor-pointer min-h-[260px]"
          >
            <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600">
              <IconPlus className="h-5 w-5" size={20} />
            </div>
            <div>
              <h4 className="text-sm font-medium text-zinc-800">Create Another Project</h4>
              <p className="text-xs text-zinc-500 max-w-[200px] mt-1">
                Start a new workspace to organize tasks and invite team members.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Dialog UI */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Set up a new project space to organize tasks and collaborate with members.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setIsCreateModalOpen(false);
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Project Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mobile App Redesign"
                className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 px-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Describe the goals, deliverables, and scope of this project..."
                className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 px-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 resize-none"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
