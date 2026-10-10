import React from 'react';
import {
  IconAlertTriangle,
  IconChecklist,
  IconCircleCheck,
  IconClock,
  IconFolderCheck,
  IconFolders,
} from '@tabler/icons-react';
import type { DashboardStats } from '@/api/query-list/dashboard.query';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardStatCardsProps {
  stats?: DashboardStats;
  isLoading: boolean;
}

export function DashboardStatCards({ stats, isLoading }: DashboardStatCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-zinc-200/80 p-5 space-y-3 shadow-2xs animate-pulse"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-7 w-12" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      label: 'Total',
      value: stats?.projects.total ?? 0,
      sub: 'Projects Enrolled',
      icon: IconFolders,
      iconBg: 'bg-zinc-100',
      iconColor: 'text-zinc-700',
      labelColor: 'text-zinc-500',
    },
    {
      label: 'Active',
      value: stats?.projects.active ?? 0,
      sub: 'In Progress',
      icon: IconFolderCheck,
      iconBg: 'bg-[#c1fbd4]/60',
      iconColor: 'text-emerald-900',
      labelColor: 'text-zinc-500',
    },
    {
      label: 'Tasks',
      value: stats?.tasks.total ?? 0,
      sub: 'Assigned Deliverables',
      icon: IconChecklist,
      iconBg: 'bg-zinc-100',
      iconColor: 'text-zinc-700',
      labelColor: 'text-zinc-500',
    },
    {
      label: 'Done',
      value: stats?.tasks.completed ?? 0,
      sub: 'Resolved Tasks',
      icon: IconCircleCheck,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      labelColor: 'text-emerald-600',
    },
    {
      label: 'Pending',
      value: stats?.tasks.pending ?? 0,
      sub: 'Awaiting Action',
      icon: IconClock,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      labelColor: 'text-amber-600',
    },
    {
      label: 'Urgent',
      value: stats?.tasks.highPriority ?? 0,
      sub: 'High Priority',
      icon: IconAlertTriangle,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
      labelColor: 'text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statItems.map((item) => {
        const IconComponent = item.icon;
        return (
          <div
            key={item.label}
            className="bg-white rounded-2xl border border-zinc-200/80 p-5 space-y-3 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold uppercase tracking-wider ${item.labelColor}`}>
                {item.label}
              </span>
              <div
                className={`h-8 w-8 rounded-xl flex items-center justify-center ${item.iconBg} ${item.iconColor}`}
              >
                <IconComponent className="h-4 w-4" size={18} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-semibold tracking-tight text-zinc-950">
                {item.value}
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">{item.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
