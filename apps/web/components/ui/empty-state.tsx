import React from 'react';
import { type Icon, type TablerIcon } from '@tabler/icons-react';

export interface EmptyStateProps {
  icon?: TablerIcon | Icon | React.ComponentType<{ className?: string; size?: number | string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-zinc-200/90 bg-white/60 p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4">
      {Icon && (
        <div className="h-12 w-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-500 shadow-2xs">
          <Icon className="h-6 w-6" size={24} />
        </div>
      )}
      <div className="space-y-1 max-w-sm">
        <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
        <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
