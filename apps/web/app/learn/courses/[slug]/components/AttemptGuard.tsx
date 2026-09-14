"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui";

/**
 * Stops the course sidebar from taking a student out of a quiz they are in the
 * middle of.
 *
 * Why this exists: QuizSection already warns on tab switch, window blur and
 * `beforeunload`. None of those fire on a Next.js route change — `router.push`
 * just swaps the page in the same tab. So the lesson with the answers in it was
 * one sidebar click away, silently. This closes that one gap.
 *
 * What it is not: a wall. The browser back button, a second tab and a second
 * device all get past it. It raises the cost from "one click" to "a deliberate
 * act that is counted", and the counting is the part that matters — leaving is
 * reported with the attempt.
 */
interface AttemptGuardValue {
  attemptOpen: boolean;
  /** QuizSection calls this as its `taking` state changes. */
  setAttemptOpen: (open: boolean) => void;
  /**
   * Navigate, unless an attempt is open — then ask first. Callers pass the
   * action rather than a URL so this works for pushes, links and back buttons
   * alike.
   */
  guardedNavigate: (go: () => void) => void;
  /** Fires when the student confirms leaving. QuizSection counts it. */
  onLeaveConfirmed: (handler: () => void) => () => void;
}

const AttemptGuardContext = createContext<AttemptGuardValue | null>(null);

export function AttemptGuardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [attemptOpen, setAttemptOpen] = useState(false);
  const [pending, setPending] = useState<(() => void) | null>(null);
  const leaveHandlers = useRef(new Set<() => void>());

  const guardedNavigate = useCallback(
    (go: () => void) => {
      if (!attemptOpen) {
        go();
        return;
      }
      // Store the function itself, not its result: setState treats a function
      // argument as an updater, so it has to be wrapped.
      setPending(() => go);
    },
    [attemptOpen],
  );

  const onLeaveConfirmed = useCallback((handler: () => void) => {
    leaveHandlers.current.add(handler);
    return () => {
      leaveHandlers.current.delete(handler);
    };
  }, []);

  const value = useMemo(
    () => ({ attemptOpen, setAttemptOpen, guardedNavigate, onLeaveConfirmed }),
    [attemptOpen, guardedNavigate, onLeaveConfirmed],
  );

  function confirmLeave() {
    const go = pending;
    setPending(null);
    leaveHandlers.current.forEach((handler) => handler());
    go?.();
  }

  return (
    <AttemptGuardContext.Provider value={value}>
      {children}

      {pending && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setPending(null)}
            aria-hidden
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="attempt-guard-title"
            className="relative w-full max-w-sm rounded-2xl bg-surface-card border border-border shadow-xl p-6"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center shrink-0">
                <AlertTriangle
                  size={16}
                  className="text-amber-600 dark:text-amber-300"
                />
              </div>
              <div className="min-w-0">
                <h2
                  id="attempt-guard-title"
                  className="font-heading font-bold text-base text-foreground"
                >
                  Your quiz is still open
                </h2>
                <p className="font-body text-sm text-muted mt-1">
                  The clock keeps running while you are away, and leaving is
                  recorded with your attempt. Your answers on this page are not
                  saved.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              <Button
                size="md"
                variant="secondary"
                onClick={() => setPending(null)}
              >
                Stay on the quiz
              </Button>
              <Button size="md" onClick={confirmLeave}>
                Leave anyway
              </Button>
            </div>
          </div>
        </div>
      )}
    </AttemptGuardContext.Provider>
  );
}

/**
 * Safe outside the provider: quiz pages are always inside the course layout,
 * but QuizSection should not explode if it is ever rendered elsewhere.
 */
export function useAttemptGuard(): AttemptGuardValue {
  const ctx = useContext(AttemptGuardContext);
  return (
    ctx ?? {
      attemptOpen: false,
      setAttemptOpen: () => {},
      guardedNavigate: (go: () => void) => go(),
      onLeaveConfirmed: () => () => {},
    }
  );
}
