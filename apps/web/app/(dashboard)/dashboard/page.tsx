'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { IconPlus } from '@tabler/icons-react';
import { useDashboardStats } from '@/api/api-hooks/dashboard.api-hook';
import { useProjects } from '@/api/api-hooks/projects.api-hook';
import { useProjectTasks } from '@/api/api-hooks/tasks.api-hook';
import { Alert } from '@/components/ui/alert';
import { getApiErrorMessage } from '@/lib/axios';

import { DashboardStatCards } from './components/dashboard-stat-cards';
import { ActiveWorkspaces } from './components/active-workspaces';
import { PriorityQueue } from './components/priority-queue';

export default function DashboardPage() {
  const {
    data: stats,
    isLoading: isStatsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useDashboardStats();

  const {
    data: projects = [],
    isLoading: isProjectsLoading,
    error: projectsError,
    refetch: refetchProjects,
  } = useProjects();

  // State to switch workspace in Priority Queue when multiple projects exist
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const activeProjectId =
    selectedProjectId && projects.some((p) => p.id === selectedProjectId)
      ? selectedProjectId
      : projects[0]?.id;

  const {
    data: urgentTasksData,
    isLoading: isTasksLoading,
    refetch: refetchTasks,
  } = useProjectTasks(activeProjectId, {
    priority: 'HIGH',
    limit: 6,
    sortBy: 'dueDate',
    order: 'asc',
  });

  const urgentTasks = urgentTasksData?.data || [];
  const activeProject = projects.find((p) => p.id === activeProjectId);

  const handleRetryAll = () => {
    refetchStats();
    refetchProjects();
    if (activeProjectId) refetchTasks();
  };

  const combinedError = statsError || projectsError;
  const isLoading = isStatsLoading || isProjectsLoading;

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-zinc-950">
            Workspace Dashboard
          </h1>
          <p className="text-sm text-zinc-500">
            Live overview of project health, member allocation, and pending task deliverables.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/90 bg-white py-2 px-4 text-xs sm:text-sm font-medium text-zinc-800 shadow-2xs hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
          >
            <span>View All Projects</span>
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 rounded-full bg-black py-2 px-5 text-xs sm:text-sm font-medium text-white shadow-xs hover:bg-neutral-800 transition-colors"
          >
            <IconPlus className="h-4 w-4" size={16} />
            <span>New Project</span>
          </Link>
        </div>
      </div>

      {/* Error State Banner */}
      {combinedError && (
        <Alert
          type="error"
          title="Failed to load dashboard data"
          message={getApiErrorMessage(combinedError, 'Unable to retrieve workspace analytics.')}
          onRetry={handleRetryAll}
        />
      )}

      {/* 6 Core Metrics Cards */}
      <DashboardStatCards stats={stats} isLoading={isLoading} />

      {/* Two Column Layout: Active Workspaces & Priority Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActiveWorkspaces projects={projects} isLoading={isProjectsLoading} />

        <PriorityQueue
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
          urgentTasks={urgentTasks}
          urgentCount={stats?.tasks.highPriority ?? 0}
          isLoading={isTasksLoading || isProjectsLoading}
          activeProject={activeProject}
        />
      </div>
    </div>
  );
}
