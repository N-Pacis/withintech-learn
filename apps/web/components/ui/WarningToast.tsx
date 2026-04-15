"use client";

import { ShieldAlert, X } from "lucide-react";

interface WarningToastProps {
  visible: boolean;
  count: number;
  onClose: () => void;
}

export function WarningToast({ visible, count, onClose }: WarningToastProps) {
  if (!visible) return null;

  return (
    <div
      key={count}
      className="fixed top-6 left-1/2 z-[9999] w-[calc(100vw-2rem)] max-w-md"
      style={{
        animation:
          "warning-shake 0.65s ease-out forwards, warning-in 0.25s ease-out",
      }}
    >
      <div className="flex items-start gap-3 bg-surface-card border border-border rounded-2xl shadow-lg px-4 py-3.5">
        {/* Icon */}
        <span className="shrink-0 w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center mt-0.5">
          <ShieldAlert size={16} className="text-primary" />
        </span>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="font-body text-sm font-semibold text-foreground leading-snug">
            Please remain on this tab.
          </p>
          <p className="font-body text-xs text-muted mt-0.5 leading-snug">
            Any cheating behavior is prohibited.
          </p>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="shrink-0 mt-0.5 p-1.5 rounded-lg text-muted-contrast hover:text-primary hover:bg-primary-soft transition-colors"
          aria-label="Dismiss"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
