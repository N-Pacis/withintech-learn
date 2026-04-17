import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

export function SaveWarning({ message }: { message: ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-warning-soft border border-warning/20 rounded-lg">
      <AlertCircle size={13} className="shrink-0 text-warning-dark" />
      <p className="font-body text-xs text-warning-dark">{message}</p>
    </div>
  );
}
