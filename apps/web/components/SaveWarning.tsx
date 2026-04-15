import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

export function SaveWarning({ message }: { message: ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg">
      <AlertCircle size={13} className="shrink-0 text-amber-600" />
      <p className="font-body text-xs text-amber-700">{message}</p>
    </div>
  );
}
