import React from 'react';

export type TaskStatusType = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'Todo' | 'In Progress' | 'Done';
export type TaskPriorityType = 'LOW' | 'MEDIUM' | 'HIGH' | 'Low' | 'Medium' | 'High';
export type RoleType = 'OWNER' | 'MEMBER' | 'Owner' | 'Member';

export function StatusBadge({ status }: { status: TaskStatusType }) {
  const normalized = status.toUpperCase().replace(' ', '_');

  switch (normalized) {
    case 'DONE':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>Done</span>
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span>In Progress</span>
        </span>
      );
    case 'TODO':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200/60">
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
          <span>Todo</span>
        </span>
      );
  }
}

export function PriorityBadge({ priority }: { priority: TaskPriorityType }) {
  const normalized = priority.toUpperCase();

  switch (normalized) {
    case 'HIGH':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200/60">
          High
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
          Medium
        </span>
      );
    case 'LOW':
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200/60">
          Low
        </span>
      );
  }
}

export function RoleBadge({ role }: { role: RoleType }) {
  const isOwner = role.toUpperCase() === 'OWNER';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        isOwner
          ? 'bg-[#c1fbd4] text-zinc-900 shadow-2xs'
          : 'bg-zinc-100 text-zinc-700 border border-zinc-200/60'
      }`}
    >
      {isOwner ? 'Owner' : 'Member'}
    </span>
  );
}
