"use client";

import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface WarningToastProps {
  visible: boolean;
  count: number;
  onClose: () => void;
  /** Optional context label — defaults to "quiz". */
  context?: string;
}

export function WarningToast({
  visible,
  count,
  onClose,
  context = "quiz",
}: WarningToastProps) {
  if (!visible) return null;

  return (
    <div
      key={count}
      className="fixed top-6 left-1/2 z-[9999] w-[calc(100vw-2rem)] max-w-sm"
      style={{ animation: "warning-shake 0.65s ease-out forwards, warning-in 0.25s ease-out" }}
    >
      {/* Card */}
      <div className="relative overflow-hidden rounded-2xl bg-[#1C0033] shadow-[0_12px_40px_rgba(0,0,0,0.35)] border border-white/10">
        {/* Top accent line */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-amber-400/0 via-amber-400 to-amber-400/0" />

        <div className="flex items-start gap-3 px-4 pt-5 pb-5">
          {/* Icon bubble */}
          <span className="shrink-0 w-9 h-9 rounded-xl bg-amber-400/15 ring-1 ring-amber-400/30 flex items-center justify-center mt-0.5">
            <AlertTriangle size={17} className="text-amber-400" />
          </span>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-body text-sm font-semibold text-white leading-snug">
                Focus Warning
              </p>
              {count > 1 && (
                <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-amber-400/20 text-amber-400 font-body font-bold text-[10px] leading-none">
                  ×{count}
                </span>
              )}
            </div>
            <p className="font-body text-xs text-white/55 mt-0.5 leading-snug">
              You left the {context} page. This is being recorded.
            </p>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className={cn(
              "shrink-0 mt-0.5 p-1.5 rounded-lg transition-colors",
              "text-white/30 hover:text-white hover:bg-white/10",
            )}
            aria-label="Dismiss"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
