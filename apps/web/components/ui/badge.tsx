import React from 'react';

export type TaskStatusType = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'Todo' | 'In Progress' | 'Done';
export type TaskPriorityType = 'LOW' | 'MEDIUM' | 'HIGH' | 'Low' | 'Medium' | 'High';
export type RoleType = 'OWNER' | 'MEMBER' | 'Owner' | 'Member';

export function StatusBadge({ status }: { status: TaskStatusType }) {
  const normalized = status.toUpperCase().replace(' ', '_');

  switch (normalized) {
    case 'DONE':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-900 border border-zinc-300">
          <span className="h-1.5 w-1.5 rounded-full bg-black" />
          <span>Done</span>
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-black text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          <span>In Progress</span>
        </span>
      );
    case 'TODO':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-50 text-zinc-700 border border-zinc-200">
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
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-black text-white">
          High
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
          Medium
        </span>
      );
    case 'LOW':
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-50 text-zinc-600 border border-zinc-200">
          Low
        </span>
      );
  }
}

export function RoleBadge({ role }: { role: RoleType }) {
  const isOwner = role.toUpperCase() === 'OWNER';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium tracking-wide ${
        isOwner
          ? 'bg-black text-white shadow-2xs'
          : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
      }`}
    >
      {isOwner ? 'Owner' : 'Member'}
    </span>
  );
}
