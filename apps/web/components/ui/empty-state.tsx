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
    <div className="rounded-lg border border-dashed border-zinc-200 bg-white p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4">
      {Icon && (
        <div className="h-10 w-10 rounded-md bg-zinc-100 flex items-center justify-center text-zinc-900 shadow-2xs">
          <Icon className="h-5 w-5" size={20} />
        </div>
      )}
      <div className="space-y-1 max-w-sm">
        <h3 className="text-base font-heading font-semibold text-black">{title}</h3>
        <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
