'use client';

import React, { forwardRef, useState } from 'react';
import { IconAlertCircle, IconEye, IconEyeOff, type Icon, type TablerIcon } from '@tabler/icons-react';

export interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: TablerIcon | Icon | React.ComponentType<{ className?: string; size?: number | string }>;
  label?: string;
  error?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ icon: Icon, label, error, type = 'text', className = '', id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const computedType = isPassword ? (showPassword ? 'text' : 'password') : type;
    const inputId = id || props.name;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-zinc-600"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {Icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
              <Icon className="h-4 w-4" size={16} />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={computedType}
            className={`w-full rounded-xl border bg-white py-3 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
              Icon ? 'pl-10' : 'pl-3.5'
            } ${isPassword ? 'pr-11' : 'pr-3.5'} ${
              error
                ? 'border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-500/10'
                : 'border-zinc-200 hover:border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900/10'
            } ${className}`}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-zinc-700 transition-colors focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <IconEyeOff className="h-4 w-4 text-zinc-500" size={16} />
              ) : (
                <IconEye className="h-4 w-4 text-zinc-500" size={16} />
              )}
            </button>
          )}
        </div>

        {error && (
          <p
            className="flex items-center gap-1 text-xs font-medium text-red-600 pt-0.5"
            role="alert"
          >
            <IconAlertCircle className="h-3.5 w-3.5 shrink-0" size={14} />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  },
);

AuthInput.displayName = 'AuthInput';
