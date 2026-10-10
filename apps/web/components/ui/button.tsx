'use client';

import { cn } from '@/lib/utils';
import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-offset-1 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        // button-primary-pill from DESIGN.md
        default: 'bg-black text-white hover:bg-neutral-800 focus-visible:ring-black shadow-xs',
        primary: 'bg-black text-white hover:bg-neutral-800 focus-visible:ring-black shadow-xs',
        // button-outline-on-light from DESIGN.md
        outline:
          'border border-zinc-200/90 bg-white text-zinc-900 hover:bg-zinc-50 hover:border-zinc-300 focus-visible:ring-zinc-400 shadow-2xs',
        // button-aloe-pill from DESIGN.md
        aloe: 'bg-[#c1fbd4] text-zinc-950 hover:bg-[#a9f5c2] focus-visible:ring-emerald-400 font-semibold shadow-xs',
        // destructive & danger
        destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-xs',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-xs',
        secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200/80 focus-visible:ring-zinc-400',
        ghost:
          'bg-transparent text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:ring-zinc-300',
        link: 'text-zinc-900 underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'py-2.5 px-5 text-xs sm:text-sm',
        sm: 'py-1.5 px-3.5 text-xs',
        lg: 'py-3.5 px-7 text-sm sm:text-base font-semibold',
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
