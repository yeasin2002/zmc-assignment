import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'aloe' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      className = '',
      ...props
    },
    ref,
  ) => {
    // DESIGN.md: "Pill-shape ({rounded.pill}) is the only button shape across both tracks"
    const baseStyles =
      'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer';

    const variantStyles = {
      // button-primary-pill
      primary: 'bg-black text-white hover:bg-neutral-800 focus:ring-black shadow-xs',
      // button-outline-on-light
      outline:
        'border border-zinc-200/90 bg-white text-zinc-900 hover:bg-zinc-50 hover:border-zinc-300 focus:ring-zinc-400 shadow-2xs',
      // button-aloe-pill
      aloe: 'bg-[#c1fbd4] text-zinc-950 hover:bg-[#a9f5c2] focus:ring-emerald-400 font-semibold shadow-xs',
      // danger pill
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-xs',
      // ghost
      ghost: 'bg-transparent text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 focus:ring-zinc-300',
    }[variant];

    const sizeStyles = {
      sm: 'py-1.5 px-3.5 text-xs',
      md: 'py-2.5 px-5 text-xs sm:text-sm',
      lg: 'py-3.5 px-7 text-sm sm:text-base font-semibold',
    }[size];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        {...props}
      >
        {isLoading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent shrink-0" />
        )}
        <span>{children}</span>
      </button>
    );
  },
);

Button.displayName = 'Button';
