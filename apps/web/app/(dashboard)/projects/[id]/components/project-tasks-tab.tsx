'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  IconChecklist,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react';
import { useProjectTasks, useUpdateTask } from '@/api/api-hooks/tasks.api-hook';
import type { ProjectMember } from '@/api/query-list/projects.query';
import type { Task, TaskFilters, TaskPriority, TaskStatus } from '@/api/query-list/tasks.query';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { getApiErrorMessage } from '@/lib/axios';

import { TasksTable } from './tasks-table';
import { TaskModal } from './task-modal';
import { DeleteTaskDialog } from './delete-task-dialog';

interface ProjectTasksTabProps {
  projectId: string;
  members: ProjectMember[];
  isOwner: boolean;
}

export function ProjectTasksTab({
  projectId,
  members,
  isOwner,
}: ProjectTasksTabProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read URL query parameters
  const searchParam = searchParams.get('search') || '';
  const statusParam = (searchParams.get('status') as TaskStatus) || '';
  const priorityParam = (searchParams.get('priority') as TaskPriority) || '';
  const assigneeIdParam = searchParams.get('assigneeId') || '';
  const sortByParam = (searchParams.get('sortBy') as 'dueDate' | 'createdAt') || 'createdAt';
  const orderParam = (searchParams.get('order') as 'asc' | 'desc') || 'desc';
  const pageParam = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  // Local state for debounced search input (with render adjustment for URL changes)
  const [searchInput, setSearchInput] = useState(searchParam);
  const [prevSearchParam, setPrevSearchParam] = useState(searchParam);

  if (prevSearchParam !== searchParam) {
    setPrevSearchParam(searchParam);
    setSearchInput(searchParam);
  }

  // URL Synchronization helper
  const updateFilters = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, val]) => {
        if (val === undefined || val === '' || val === null) {
          params.delete(key);
        } else {
          params.set(key, String(val));
        }
      });

      // Reset page to 1 whenever a filter other than page changes
      if (!('page' in updates)) {
        params.delete('page');
      }

      const queryString = params.toString();
      router.replace(`${pathname}${queryString ? `?${queryString}` : ''}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  // Debounce search input to URL query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchParam) {
        updateFilters({ search: searchInput.trim() || undefined });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput, searchParam, updateFilters]);

  // Build query filter object
  const currentFilters: TaskFilters = {
    search: searchParam || undefined,
    status: statusParam || undefined,
    priority: priorityParam || undefined,
    assigneeId: assigneeIdParam || undefined,
    sortBy: sortByParam,
    order: orderParam,
    page: pageParam,
    limit: 10,
  };

  // Queries & Mutations
  const {
    data: tasksData,
    isLoading,
    error,
    refetch,
  } = useProjectTasks(projectId, currentFilters);

  const updateTaskMutation = useUpdateTask();

  const tasks = tasksData?.data || [];
  const meta = tasksData?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 };

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const handleOpenCreate = () => {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleInlineStatusChange = async (task: Task, newStatus: TaskStatus) => {
    if (task.status === newStatus) return;
    try {
      await updateTaskMutation.mutateAsync({
        id: task.id,
        data: { status: newStatus },
      });
    } catch {
      // Toast notification is handled in mutation hook
    }
  };

  const resetAllFilters = () => {
    setSearchInput('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    params.delete('status');
    params.delete('priority');
    params.delete('assigneeId');
    params.delete('sortBy');
    params.delete('order');
    params.delete('page');
    const queryString = params.toString();
    router.replace(`${pathname}${queryString ? `?${queryString}` : ''}`, { scroll: false });
  };

  const hasActiveFilters =
    !!searchParam ||
    !!statusParam ||
    !!priorityParam ||
    !!assigneeIdParam ||
    sortByParam !== 'createdAt' ||
    orderParam !== 'desc';

  const startItem = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const endItem = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="space-y-6">
      {/* Query & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 space-y-3 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {/* Keyword Search */}
          <div className="relative md:col-span-2">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
              <IconSearch className="h-4 w-4" size={16} />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search tasks by title keyword..."
              className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusParam}
              onChange={(e) => updateFilters({ status: e.target.value || undefined })}
              className="w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-xs sm:text-sm text-zinc-700 outline-none focus:border-zinc-900"
            >
              <option value="">All Statuses</option>
              <option value="TODO">Todo</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityParam}
              onChange={(e) => updateFilters({ priority: e.target.value || undefined })}
              className="w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-xs sm:text-sm text-zinc-700 outline-none focus:border-zinc-900"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          {/* Assignee Filter */}
          <div>
            <select
              value={assigneeIdParam}
              onChange={(e) => updateFilters({ assigneeId: e.target.value || undefined })}
              className="w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-xs sm:text-sm text-zinc-700 outline-none focus:border-zinc-900"
            >
              <option value="">All Assignees</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div>
            <select
              value={`${sortByParam}:${orderParam}`}
              onChange={(e) => {
                const [sb, ord] = e.target.value.split(':');
                updateFilters({ sortBy: sb, order: ord });
              }}
              className="w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-xs sm:text-sm text-zinc-700 outline-none focus:border-zinc-900"
            >
              <option value="createdAt:desc">Created (Newest)</option>
              <option value="createdAt:asc">Created (Oldest)</option>
              <option value="dueDate:asc">Due Date (Earliest)</option>
              <option value="dueDate:desc">Due Date (Latest)</option>
            </select>
          </div>
        </div>

        {/* Toolbar Footer Actions */}
        <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={resetAllFilters}>
                Reset Filters
              </Button>
            )}
          </div>

          <Button size="sm" onClick={handleOpenCreate}>
            <IconPlus className="h-4 w-4" size={16} />
            <span>New Task</span>
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          type="error"
          title="Failed to load tasks"
          message={getApiErrorMessage(error, 'Unable to retrieve workspace tasks.')}
          onRetry={() => refetch()}
        />
      )}

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 space-y-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex justify-between items-center py-2.5 animate-pulse">
              <Skeleton className="h-4 w-52" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            icon={IconSearch}
            title="No tasks match your filters"
            description="Try adjusting your keyword, status, priority, or assignee filter to find deliverables."
            action={
              <Button variant="outline" size="sm" onClick={resetAllFilters}>
                Clear All Filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={IconChecklist}
            title="No tasks in this workspace yet"
            description="Create your first task deliverable to track progress and collaborate with your team."
            action={
              <Button size="sm" onClick={handleOpenCreate}>
                <IconPlus className="h-4 w-4" size={16} />
                <span>Create First Task</span>
              </Button>
            }
          />
        )
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden shadow-2xs">
          <TasksTable
            tasks={tasks}
            isOwner={isOwner}
            onEditTask={handleOpenEdit}
            onDeleteTask={(task) => setTaskToDelete(task)}
            onStatusChange={handleInlineStatusChange}
          />

          {/* Pagination & Count Footer */}
          <div className="border-t border-zinc-100 px-4 sm:px-6 py-3.5 text-xs text-zinc-500 flex items-center justify-between">
            <span>
              Showing <span className="font-semibold text-zinc-700">{startItem}</span> to{' '}
              <span className="font-semibold text-zinc-700">{endItem}</span> of{' '}
              <span className="font-semibold text-zinc-700">{meta.total}</span> tasks
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={meta.page <= 1}
                onClick={() => updateFilters({ page: meta.page - 1 })}
                aria-label="Previous page"
                className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <IconChevronLeft className="h-4 w-4" size={16} />
              </button>

              <span className="px-2 font-medium text-zinc-700">
                Page {meta.page} of {Math.max(meta.totalPages, 1)}
              </span>

              <button
                type="button"
                disabled={meta.page >= meta.totalPages}
                onClick={() => updateFilters({ page: meta.page + 1 })}
                aria-label="Next page"
                className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <IconChevronRight className="h-4 w-4" size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Creation & Edit Modal */}
      <TaskModal
        open={isTaskModalOpen}
        onOpenChange={setIsTaskModalOpen}
        projectId={projectId}
        members={members}
        taskToEdit={taskToEdit}
      />

      {/* Task Deletion Confirmation Dialog (Owner Only) */}
      <DeleteTaskDialog
        task={taskToDelete}
        open={!!taskToDelete}
        onOpenChange={(open) => !open && setTaskToDelete(null)}
      />
    </div>
  );
}
