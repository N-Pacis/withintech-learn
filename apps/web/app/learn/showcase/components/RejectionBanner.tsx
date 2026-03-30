interface RejectionBannerProps {
  reason: string;
}

export function RejectionBanner({ reason }: RejectionBannerProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#D97706"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 mt-0.5"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <div>
        <p className="font-body text-sm font-semibold text-amber-800 mb-0.5">Project was rejected</p>
        <p className="font-body text-sm text-amber-700">{reason}</p>
        <p className="font-body text-xs text-amber-600 mt-1">Fix the issues above and save to resubmit for review.</p>
      </div>
    </div>
  );
}
