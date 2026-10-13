import type { DashboardStats } from '@/api/query-list/dashboard.query';
import { Skeleton } from '@/components/ui/skeleton';
import {
  IconAlertTriangle,
  IconChecklist,
  IconCircleCheck,
  IconClock,
  IconFolderCheck,
  IconFolders,
} from '@tabler/icons-react';

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
            className="bg-white rounded-lg border border-zinc-200 p-4 space-y-3 shadow-2xs animate-pulse"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-7 w-7 rounded-md" />
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
    },
    {
      label: 'Active',
      value: stats?.projects.active ?? 0,
      sub: 'In Progress',
      icon: IconFolderCheck,
    },
    {
      label: 'Tasks',
      value: stats?.tasks.total ?? 0,
      sub: 'Assigned Tasks',
      icon: IconChecklist,
    },
    {
      label: 'Done',
      value: stats?.tasks.completed ?? 0,
      sub: 'Resolved Tasks',
      icon: IconCircleCheck,
    },
    {
      label: 'Pending',
      value: stats?.tasks.pending ?? 0,
      sub: 'Awaiting Action',
      icon: IconClock,
    },
    {
      label: 'Urgent',
      value: stats?.tasks.highPriority ?? 0,
      sub: 'High Priority',
      icon: IconAlertTriangle,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statItems.map((item) => {
        const IconComponent = item.icon;
        return (
          <div
            key={item.label}
            className="bg-white rounded-lg border border-zinc-200 p-4 space-y-3 shadow-2xs hover:border-zinc-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-medium">
                {item.label}
              </span>
              <div className="h-7 w-7 rounded-md flex items-center justify-center bg-zinc-100 text-black border border-zinc-200">
                <IconComponent className="h-3.5 w-3.5" size={16} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-heading font-bold tracking-tight text-black">
                {item.value}
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">{item.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
