import { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center font-body font-medium tracking-widest uppercase rounded',
  {
    variants: {
      variant: {
        default:  'bg-[#F3E8FF] text-[#3D006B]',
        purple:   'bg-[#3D006B] text-white',
        orange:   'bg-[#F97316] text-white',
        gray:     'border border-[#E5E7EB] text-[#6B7280]',
        success:  'bg-green-50 text-green-700',
        danger:   'bg-red-50 text-red-600',
        warning:  'bg-amber-50 text-amber-700',
      },
      size: {
        sm: 'text-[10px] px-2 py-0.5',
        md: 'text-xs px-2.5 py-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  },
);

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}
