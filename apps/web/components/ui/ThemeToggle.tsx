"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300 focus:outline-none",
        isDark ? "bg-primary-dark" : "bg-border-strong",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex h-4 w-4 items-center justify-center rounded-full bg-white shadow transition-transform duration-300",
          isDark ? "translate-x-6" : "translate-x-1",
        )}
      >
        {isDark ? (
          <Moon size={9} className="text-primary-dark fill-current" />
        ) : (
          <Sun size={9} className="text-warning fill-current" />
        )}
      </span>
    </button>
  );
}
