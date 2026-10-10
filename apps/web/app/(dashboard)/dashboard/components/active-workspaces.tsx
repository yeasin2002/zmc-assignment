import React from 'react';
import Link from 'next/link';
import {
  IconArrowRight,
  IconFolders,
  IconPlus,
  IconUsers,
} from '@tabler/icons-react';
import type { ProjectListItem } from '@/api/query-list/projects.query';
import { RoleBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

interface ActiveWorkspacesProps {
  projects: ProjectListItem[];
  isLoading: boolean;
}

export function ActiveWorkspaces({ projects, isLoading }: ActiveWorkspacesProps) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 space-y-5 shadow-2xs">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
        <div>
          <h2 className="text-base font-medium text-zinc-900">Active Workspaces</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Current workspaces where you collaborate or manage deliverables
          </p>
        </div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-900 hover:text-black transition-colors"
        >
          <span>All Projects</span>
          <IconArrowRight className="h-3.5 w-3.5" size={14} />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-zinc-200/70 p-4 space-y-2 animate-pulse"
            >
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-3 w-48" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={IconFolders}
          title="No workspaces yet"
          description="You do not belong to any projects yet. Create a project workspace to get started."
          action={
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 rounded-full bg-black py-2 px-4 text-xs font-medium text-white shadow-xs hover:bg-neutral-800 transition-colors"
            >
              <IconPlus className="h-3.5 w-3.5" size={14} />
              <span>Create Workspace</span>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {projects.slice(0, 5).map((project) => {
            const totalTasks = project._count?.tasks ?? 0;
            const membersCount = project._count?.members ?? 1;

            return (
              <div
                key={project.id}
                className="rounded-xl border border-zinc-200/70 p-4 space-y-3 hover:border-zinc-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 min-w-0 pr-3">
                    <Link
                      href={`/projects/${project.id}`}
                      className="font-medium text-sm text-zinc-900 hover:underline truncate block"
                    >
                      {project.name}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <IconUsers className="h-3 w-3" size={12} />
                        {membersCount} {membersCount === 1 ? 'member' : 'members'}
                      </span>
                      <span>•</span>
                      <span>
                        {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'} total
                      </span>
                    </div>
                  </div>

                  <RoleBadge role={project.currentUserRole} />
                </div>

                {project.description && (
                  <p className="text-xs text-zinc-500 line-clamp-1 leading-relaxed">
                    {project.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
