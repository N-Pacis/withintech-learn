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
      style={{ animation: "warning-shake 0.65s ease-out forwards, warning-in 0.25s ease-out" }}
    >
      <div className="flex items-start gap-3 bg-white border border-[#E5E7EB] rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.10)] px-4 py-3.5">
        {/* Icon */}
        <span className="shrink-0 w-8 h-8 rounded-lg bg-[#F3E8FF] flex items-center justify-center mt-0.5">
          <ShieldAlert size={16} className="text-[#3D006B]" />
        </span>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="font-body text-sm font-semibold text-[#0F0F0F] leading-snug">
            Please remain on this tab.
          </p>
          <p className="font-body text-xs text-[#6B7280] mt-0.5 leading-snug">
            Any cheating behavior is prohibited.
          </p>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="shrink-0 mt-0.5 p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#3D006B] hover:bg-[#F3E8FF] transition-colors"
          aria-label="Dismiss"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
