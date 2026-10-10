'use client';

import React from 'react';
import { IconCalendar, IconEdit, IconTrash } from '@tabler/icons-react';
import type { Task, TaskStatus } from '@/api/query-list/tasks.query';
import { PriorityBadge } from '@/components/ui/badge';

interface TasksTableProps {
  tasks: Task[];
  isOwner: boolean;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}

export function TasksTable({
  tasks,
  isOwner,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}: TasksTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead className="border-b border-zinc-200/80 bg-zinc-50/60 text-zinc-500 uppercase tracking-wider text-[11px] font-semibold">
          <tr>
            <th className="py-3 px-4 sm:px-6">Task Title</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Priority</th>
            <th className="py-3 px-4">Assignee</th>
            <th className="py-3 px-4">Due Date</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 text-zinc-800">
          {tasks.map((task: Task) => (
            <tr key={task.id} className="hover:bg-zinc-50/50 transition-colors">
              {/* Title & Description */}
              <td className="py-3.5 px-4 sm:px-6">
                <div className="font-medium text-zinc-900">{task.title}</div>
                {task.description && (
                  <div className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                    {task.description}
                  </div>
                )}
              </td>

              {/* Inline Status Toggle / Selector */}
              <td className="py-3.5 px-4 whitespace-nowrap">
                <select
                  value={task.status}
                  onChange={(e) => onStatusChange(task, e.target.value as TaskStatus)}
                  className="rounded-lg border border-zinc-200/80 bg-white py-1 px-2 text-xs text-zinc-800 outline-none hover:border-zinc-300 focus:border-zinc-900 transition-colors"
                >
                  <option value="TODO">Todo</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </td>

              {/* Priority Badge */}
              <td className="py-3.5 px-4 whitespace-nowrap">
                <PriorityBadge priority={task.priority} />
              </td>

              {/* Assignee */}
              <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                {task.assignee ? (
                  <div className="flex items-center gap-1.5">
                    <div className="h-5 w-5 rounded-full bg-zinc-200 text-zinc-700 text-[10px] font-bold flex items-center justify-center">
                      {task.assignee.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-zinc-800 font-medium">
                      {task.assignee.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-zinc-400 italic">Unassigned</span>
                )}
              </td>

              {/* Due Date */}
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

              {/* Actions: Edit & Owner-Only Delete */}
              <td className="py-3.5 px-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => onEditTask(task)}
                    title="Edit task"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer"
                  >
                    <IconEdit className="h-4 w-4" size={16} />
                  </button>

                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => onDeleteTask(task)}
                      title="Delete task"
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <IconTrash className="h-4 w-4" size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
