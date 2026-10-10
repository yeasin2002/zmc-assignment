import React from 'react';
import {
  IconAlertCircle,
  IconCheck,
  IconInfoCircle,
  IconRefresh,
  IconX,
} from '@tabler/icons-react';

export interface AlertProps {
  type?: 'error' | 'success' | 'info';
  title?: string;
  message: string;
  onRetry?: () => void;
  onClose?: () => void;
}

export function Alert({ type = 'error', title, message, onRetry, onClose }: AlertProps) {
  const styles = {
    error: {
      container: 'border-red-200 bg-red-50 text-red-900',
      icon: <IconAlertCircle className="h-4 w-4 text-red-600 shrink-0" size={18} />,
    },
    success: {
      container: 'border-emerald-200 bg-emerald-50 text-emerald-900',
      icon: <IconCheck className="h-4 w-4 text-emerald-600 shrink-0" size={18} />,
    },
    info: {
      container: 'border-blue-200 bg-blue-50 text-blue-900',
      icon: <IconInfoCircle className="h-4 w-4 text-blue-600 shrink-0" size={18} />,
    },
  }[type];

  return (
    <div
      role="alert"
      className={`rounded-xl border p-4 flex items-start justify-between gap-3 ${styles.container}`}
    >
      <div className="flex items-start gap-3">
        <div className="pt-0.5">{styles.icon}</div>
        <div className="space-y-0.5">
          {title && <h4 className="text-xs sm:text-sm font-semibold">{title}</h4>}
          <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-white border border-current shadow-2xs hover:opacity-80 transition-opacity cursor-pointer"
          >
            <IconRefresh className="h-3 w-3" size={12} />
            <span>Retry</span>
          </button>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss alert"
            className="p-1 rounded-md hover:bg-black/5 text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
          >
            <IconX className="h-3.5 w-3.5" size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
