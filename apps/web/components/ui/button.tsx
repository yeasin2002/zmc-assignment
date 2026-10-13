'use client';

import { cn } from '@/lib/utils';
import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-offset-1 active:scale-95 disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-black text-white hover:bg-neutral-800 focus-visible:ring-black shadow-xs',
        primary: 'bg-black text-white hover:bg-neutral-800 focus-visible:ring-black shadow-xs',
        outline:
          'border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-100 hover:border-zinc-300 focus-visible:ring-zinc-400 shadow-2xs',
        secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200/80 border border-zinc-200/60 focus-visible:ring-zinc-400',
        destructive: 'bg-black text-white hover:bg-red-600 focus-visible:ring-red-500 shadow-xs',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-xs',
        ghost:
          'bg-transparent text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:ring-zinc-300',
        link: 'text-zinc-900 underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-9 px-4 text-xs sm:text-sm',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-6 text-sm sm:text-base font-semibold',
        icon: 'h-8 w-8 p-0',
        'icon-sm': 'h-7 w-7 p-0',
        'icon-lg': 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps extends ButtonPrimitive.Props, VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

function Button({
  className,
  variant = 'default',
  size = 'default',
  isLoading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      disabled={disabled || isLoading}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {isLoading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent shrink-0" />
      )}
      {children}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants };
