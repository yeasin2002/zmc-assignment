'use client';

import React, { useState } from 'react';
import {
  IconCalendar,
  IconChecklist,
  IconSearch,
} from '@tabler/icons-react';
import type { Task } from '@/api/query-list/tasks.query';
import { PriorityBadge, StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

interface ProjectTasksTabProps {
  tasks: Task[];
  isLoading: boolean;
}

export function ProjectTasksTab({ tasks, isLoading }: ProjectTasksTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const filteredTasks = tasks.filter((task: Task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = !statusFilter || task.status === statusFilter;
    const matchesPriority = !priorityFilter || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPriorityFilter('');
  };

  return (
    <div className="space-y-6">
      {/* Query Toolbar */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 space-y-3 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div className="relative md:col-span-2">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
              <IconSearch className="h-4 w-4" size={16} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title or details..."
              className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-xs sm:text-sm text-zinc-700 outline-none focus:border-zinc-900"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div className="flex items-center justify-end">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Task Table, Skeleton, or Empty State */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="flex justify-between items-center py-2 animate-pulse">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={IconChecklist}
          title="No tasks in this workspace yet"
          description="Get started by creating your first task to track progress and assign deliverables."
        />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={IconSearch}
          title="No tasks match your filters"
          description="Try adjusting your status, priority, or search query to find tasks."
          action={
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-zinc-200/80 bg-zinc-50/60 text-zinc-500 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Task Title</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-800">
                {filteredTasks.map((task: Task) => (
                  <tr key={task.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-medium text-zinc-900">{task.title}</div>
                      {task.description && (
                        <div className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                          {task.description}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={task.status} />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={task.priority} />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                      {task.assignee ? (
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-full bg-zinc-200 text-zinc-700 text-[10px] font-bold flex items-center justify-center">
                            {task.assignee.name.charAt(0)}
                          </div>
                          <span className="text-zinc-800 font-medium">
                            {task.assignee.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-zinc-500">
                      {task.dueDate ? (
                        <div className="inline-flex items-center gap-1">
                          <IconCalendar className="h-3.5 w-3.5 text-zinc-400" size={14} />
                          <span>
                            {new Date(task.dueDate).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-zinc-400">No due date</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Task Count Bar */}
          <div className="border-t border-zinc-100 px-4 sm:px-6 py-3.5 text-xs text-zinc-500 flex items-center justify-between">
            <span>
              Showing <span className="font-semibold text-zinc-700">{filteredTasks.length}</span> of{' '}
              <span className="font-semibold text-zinc-700">{tasks.length}</span> tasks
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
