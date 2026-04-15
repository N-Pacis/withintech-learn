import { forwardRef, ButtonHTMLAttributes, cloneElement, isValidElement, ReactElement } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import Spinner from './Spinner';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-body font-medium transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary:   'bg-[#3D006B] text-white hover:bg-[#2A004A]',
        secondary: 'border border-[#3D006B] text-[#3D006B] hover:bg-[#F3E8FF] dark:border-[#7C3AED] dark:text-[#C084FC] dark:hover:bg-[#2d1a4a]',
        ghost:     'text-[#6B7280] hover:text-[#3D006B] hover:bg-[#F3E8FF] dark:text-[#9CA3AF] dark:hover:text-[#C084FC] dark:hover:bg-[#2d1a4a]',
        danger:    'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        sm: 'text-xs px-4 py-2.5 rounded-md',
        md: 'text-sm px-6 py-2.5 rounded-md',
        lg: 'text-base px-7 py-3.5 rounded-md',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, loading, disabled, asChild, children, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size, fullWidth }), className);

    if (asChild && isValidElement(children)) {
      return cloneElement(children as ReactElement<{ className?: string }>, {
        className: cn(classes, (children as ReactElement<{ className?: string }>).props.className),
      });
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={classes}
        {...props}
      >
        {loading && <Spinner size="sm" color="current" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
