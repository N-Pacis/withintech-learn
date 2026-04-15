import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "brand" | "white" | "current";
  className?: string;
}

const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };
const colors = {
  brand: "border-primary border-t-transparent",
  white: "border-white border-t-transparent",
  current: "border-current border-t-transparent",
};

export default function Spinner({
  size = "md",
  color = "brand",
  className,
}: SpinnerProps) {
  return (
    <div
      className={cn(
        "rounded-full border-2 animate-spin shrink-0",
        sizes[size],
        colors[color],
        className,
      )}
    />
  );
}
