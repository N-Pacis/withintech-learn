import { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center font-body font-medium tracking-widest uppercase rounded",
  {
    variants: {
      variant: {
        default: "bg-primary-soft text-primary",
        purple: "bg-primary text-white",
        orange: "bg-[#F97316] text-white",
        gray: "border border-border text-muted",
        success: "bg-green-50 text-green-700 dark:bg-green-600 dark:text-white",
        danger: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
        warning:
          "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
      },
      size: {
        sm: "text-[10px] px-2 py-0.5",
        md: "text-xs px-2.5 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  },
);

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}
