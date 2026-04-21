"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, PageLoader, Card, CardBody } from "@/components/ui";
import { useModules, useDeleteModule } from "@/hooks/queries/modules";
import { cn } from "@/lib/utils";

export function ModuleCards({
  courseId,
  isDraft,
}: {
  courseId: string;
  isDraft: boolean;
}) {
  const { data: modules = [], isLoading } = useModules(courseId);
  const { mutate: deleteModule } = useDeleteModule(courseId);
  const router = useRouter();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const sorted = [...modules].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading font-bold text-lg text-foreground">
            Modules
            {modules.length > 0 && (
              <span className="text-muted-contrast font-normal ml-2 text-base">
                ({modules.length})
              </span>
            )}
          </h2>
          {modules.length > 0 && (
            <p className="font-body text-xs text-muted-contrast mt-0.5">
              Click a module to view and edit its content.
            </p>
          )}
        </div>
        {isDraft && (
          <Button size="sm" asChild>
            <Link href={`/admin/courses/${courseId}/modules/new`}>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Module
            </Link>
          </Button>
        )}
      </div>

      {isLoading ? (
        <PageLoader type="list" count={3} />
      ) : sorted.length === 0 ? (
        <Card>
          <CardBody>
            <div className="flex flex-col items-center text-center py-8">
              <div className="w-12 h-12 rounded-full bg-primary-soft flex items-center justify-center mb-3">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#3D006B"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <p className="font-heading font-semibold text-sm text-foreground mb-1">
                No modules yet
              </p>
              <p className="font-body text-xs text-muted-contrast mb-4">
                Add your first module to start building this course.
              </p>
              {isDraft && (
                <Button size="sm" asChild>
                  <Link href={`/admin/courses/${courseId}/modules/new`}>
                    Add first module
                  </Link>
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((mod) => (
            <div
              key={mod.id}
              className={cn(
                "group flex items-center gap-4 px-5 py-4 bg-surface-card border border-border rounded-xl cursor-pointer",
                "hover:border-primary/30 hover:shadow-[0_2px_12px_rgba(61,0,107,0.08)] transition-all duration-200",
              )}
              onClick={() =>
                router.push(`/admin/courses/${courseId}/modules/${mod.id}`)
              }
            >
              <div className="w-9 h-9 rounded-full bg-primary-soft flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors duration-200">
                <span className="font-heading font-bold text-sm text-primary group-hover:text-white transition-colors duration-200">
                  {mod.orderIndex}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-heading font-semibold text-sm text-foreground truncate">
                  {mod.title}
                </p>
                <p className="font-body text-xs text-muted-contrast mt-0.5">
                  Module {mod.orderIndex}
                </p>
              </div>

              {!mod.hasQuiz && (
                <span className="shrink-0 px-2 py-0.5 rounded font-body text-xs font-medium bg-warning-soft text-warning-dark border border-warning/20">
                  No quiz
                </span>
              )}

              <div className="flex items-center gap-2 shrink-0">
                {confirmingId === mod.id ? (
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        deleteModule(mod.id);
                        setConfirmingId(null);
                      }}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <button
                      className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-muted-contrast hover:text-red-500 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmingId(mod.id);
                      }}
                      title="Delete module"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                    <svg
                      className="text-border-strong group-hover:text-primary transition-colors duration-200"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
