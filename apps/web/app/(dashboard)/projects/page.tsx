'use client';

import React, { useState } from 'react';
import {
  IconFolder,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react';
import { useProjects } from '@/api/api-hooks/projects.api-hook';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { CardSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { getApiErrorMessage } from '@/lib/axios';

import { ProjectCard } from './components/project-card';
import { CreateProjectDialog } from './components/create-project-dialog';

export default function ProjectsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // TanStack Query for projects
  const {
    data: projects = [],
    isLoading,
    error,
    refetch,
  } = useProjects();

  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  });

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

      {/* Error Banner */}
      {error && (
        <Alert
          type="error"
          title="Failed to load projects"
          message={getApiErrorMessage(error, 'Unable to retrieve your projects.')}
          onRetry={() => refetch()}
        />
      )}

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
            Showing {filteredProjects.length} of {projects.length} projects
          </span>
        </div>
      </div>

      {/* Projects Grid, Loading Skeleton, or Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <CardSkeleton key={idx} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={IconFolder}
          title="No projects yet"
          description="You are not part of any project workspace yet. Create your first project to organize tasks and collaborate."
          action={
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <IconPlus className="h-4 w-4" size={16} />
              <span>Create Project</span>
            </Button>
          }
        />
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={IconSearch}
          title="No projects found"
          description={`No project matches the search query "${searchQuery}". Try a different keyword or clear your search.`}
          action={
            <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}

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

      {/* Create Project Dialog */}
      <CreateProjectDialog
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
}
