import {
  forwardRef,
  ButtonHTMLAttributes,
  cloneElement,
  isValidElement,
  ReactElement,
} from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import Spinner from "./Spinner";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-body font-medium transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:bg-primary-dark",
        secondary: "border border-primary text-primary hover:bg-primary-soft",
        ghost: "text-muted hover:text-primary hover:bg-primary-soft",
        danger: "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        sm: "text-xs px-4 py-2.5 rounded-md",
        md: "text-sm px-6 py-2.5 rounded-md",
        lg: "text-base px-7 py-3.5 rounded-md",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading,
      disabled,
      asChild,
      children,
      ...props
    },
    ref,
  ) => {
    const classes = cn(buttonVariants({ variant, size, fullWidth }), className);

    if (asChild && isValidElement(children)) {
      return cloneElement(children as ReactElement<{ className?: string }>, {
        className: cn(
          classes,
          (children as ReactElement<{ className?: string }>).props.className,
        ),
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

Button.displayName = "Button";

export { Button, buttonVariants };
