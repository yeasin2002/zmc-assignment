import React from 'react';
import Link from 'next/link';
import {
  IconArrowRight,
  IconChecklist,
  IconCircleCheck,
} from '@tabler/icons-react';
import type { ProjectListItem } from '@/api/query-list/projects.query';
import type { Task } from '@/api/query-list/tasks.query';
import { StatusBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

interface PriorityQueueProps {
  projects: ProjectListItem[];
  selectedProjectId: string | null;
  onSelectProject: (id: string) => void;
  urgentTasks: Task[];
  urgentCount: number;
  isLoading: boolean;
  activeProject?: ProjectListItem;
}

export function PriorityQueue({
  projects,
  selectedProjectId,
  onSelectProject,
  urgentTasks,
  urgentCount,
  isLoading,
  activeProject,
}: PriorityQueueProps) {
  const activeProjectId =
    selectedProjectId && projects.some((p) => p.id === selectedProjectId)
      ? selectedProjectId
      : projects[0]?.id;

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 space-y-5 shadow-2xs">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
        <div>
          <h2 className="text-base font-medium text-zinc-900">Priority Queue</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Tasks flagged with high priority awaiting resolution
          </p>
        </div>
        {urgentCount > 0 && (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200/60">
            {urgentCount} Urgent
          </span>
        )}
      </div>

      {/* Project Switcher */}
      {projects.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-zinc-400 font-medium shrink-0">Filter space:</span>
          {projects.slice(0, 4).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectProject(p.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                activeProjectId === p.id
                  ? 'bg-black text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-zinc-200/70 p-3.5 space-y-2 animate-pulse"
            >
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={IconChecklist}
          title="No tasks available"
          description="Join or create a workspace to view tasks in your queue."
        />
      ) : urgentTasks.length === 0 ? (
        <EmptyState
          icon={IconCircleCheck}
          title="No urgent tasks"
          description={`All high-priority tasks in ${activeProject?.name || 'this space'} are resolved or cleared!`}
          action={
            activeProjectId && (
              <Link
                href={`/projects/${activeProjectId}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-white py-1.5 px-3.5 text-xs font-medium text-zinc-800 shadow-2xs hover:bg-zinc-50 transition-colors"
              >
                <span>View all space tasks</span>
                <IconArrowRight className="h-3.5 w-3.5" size={12} />
              </Link>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          {urgentTasks.map((task) => {
            const formattedDate = task.dueDate
              ? new Date(task.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              : null;

            return (
              <div
                key={task.id}
                className="rounded-xl border border-zinc-200/70 p-3.5 flex items-center justify-between gap-3 hover:border-zinc-300 transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <Link
                    href={`/projects/${task.projectId}`}
                    className="text-xs sm:text-sm font-medium text-zinc-900 truncate hover:underline block"
                  >
                    {task.title}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    {activeProject && (
                      <span className="text-zinc-600 font-medium">{activeProject.name}</span>
                    )}
                    {formattedDate && (
                      <>
                        <span>•</span>
                        <span>Due {formattedDate}</span>
                      </>
                    )}
                  </div>
                </div>

                <StatusBadge status={task.status} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
