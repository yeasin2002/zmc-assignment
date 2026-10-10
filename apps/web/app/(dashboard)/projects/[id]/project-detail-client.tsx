'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconUserPlus,
  IconUsers,
} from '@tabler/icons-react';
import {
  useProject,
  useProjectMembers,
} from '@/api/api-hooks/projects.api-hook';
import { RoleBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { getApiErrorMessage } from '@/lib/axios';

import { ProjectTasksTab } from './components/project-tasks-tab';
import { ProjectMembersTab } from './components/project-members-tab';
import { ProjectSettingsTab } from './components/project-settings-tab';

export default function ProjectDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Tab state synced with URL search parameter
  const tabParam = searchParams.get('tab') as 'tasks' | 'members' | 'settings' | null;
  const activeTab = tabParam && ['tasks', 'members', 'settings'].includes(tabParam) ? tabParam : 'tasks';

  const handleTabChange = (tab: 'tasks' | 'members' | 'settings') => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === 'tasks') {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
  };

  // Queries
  const {
    data: project,
    isLoading: isProjectLoading,
    error: projectError,
    refetch: refetchProject,
  } = useProject(id);

  const {
    data: members = [],
    isLoading: isMembersLoading,
  } = useProjectMembers(id);

  const isOwner = project?.currentUserRole === 'OWNER';

  // Graceful handling for 403 Forbidden / 404 Not Found / Network Errors
  if (projectError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 hover:text-zinc-900 transition-colors"
          >
            <IconArrowLeft className="h-3.5 w-3.5" size={14} />
            <span>Projects</span>
          </Link>
          <span>/</span>
          <span className="text-zinc-500">Workspace Access</span>
        </div>

        <EmptyState
          icon={IconAlertTriangle}
          title="Unable to Access Project"
          description={getApiErrorMessage(
            projectError,
            'You do not have permission to access this project workspace, or the workspace no longer exists.',
          )}
          action={
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => refetchProject()}>
                Retry
              </Button>
              <Link href="/projects">
                <Button size="sm">Back to Projects</Button>
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  // Loading skeleton state
  if (isProjectLoading || !project) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 sm:p-8 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-4 w-full max-w-xl" />
          </div>
          <div className="flex gap-6 border-b border-zinc-100 pb-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 hover:text-zinc-900 transition-colors"
        >
          <IconArrowLeft className="h-3.5 w-3.5" size={14} />
          <span>Projects</span>
        </Link>
        <span>/</span>
        <span className="text-zinc-900 font-medium truncate max-w-xs">{project.name}</span>
      </div>

      {/* Project Header Card */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-zinc-950">
                {project.name}
              </h1>
              <RoleBadge role={project.currentUserRole} />
              <span className="text-xs text-zinc-400 font-mono">
                Owner: {project.owner?.name ?? 'Unknown'}
              </span>
            </div>
            <p className="text-sm text-zinc-500 max-w-2xl leading-relaxed">
              {project.description || 'No description provided.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTabChange('members')}
            >
              <IconUsers className="h-4 w-4 text-zinc-600" size={16} />
              <span>Members ({members.length})</span>
            </Button>

            {isOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTabChange('members')}
              >
                <IconUserPlus className="h-4 w-4 text-zinc-600" size={16} />
                <span>Invite Member</span>
              </Button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 border-b border-zinc-100 text-sm">
          <button
            type="button"
            onClick={() => handleTabChange('tasks')}
            className={`pb-3 font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'tasks'
                ? 'border-b-2 border-black text-zinc-900'
                : 'border-b-2 border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <span>Tasks</span>
            <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-xs font-medium">
              {project._count?.tasks ?? 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('members')}
            className={`pb-3 font-medium transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'members'
                ? 'border-b-2 border-black font-semibold text-zinc-900'
                : 'border-b-2 border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <span>Members</span>
            <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-xs font-medium">
              {members.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('settings')}
            className={`pb-3 font-medium transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'settings'
                ? 'border-b-2 border-black font-semibold text-zinc-900'
                : 'border-b-2 border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <span>Settings</span>
            {!isOwner && (
              <span className="text-[10px] uppercase font-semibold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">
                Read-only
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'tasks' && (
        <ProjectTasksTab
          projectId={id}
          members={members}
          isOwner={isOwner}
        />
      )}

      {activeTab === 'members' && (
        <ProjectMembersTab
          projectId={id}
          ownerId={project.ownerId}
          isOwner={isOwner}
          members={members}
          isLoading={isMembersLoading}
        />
      )}

      {activeTab === 'settings' && (
        <ProjectSettingsTab project={project} isOwner={isOwner} />
      )}
    </div>
  );
}
