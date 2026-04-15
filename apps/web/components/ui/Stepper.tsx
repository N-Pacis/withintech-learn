"use client";

import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepperStep {
  id: string;
  label: string;
  isCompleted?: boolean;
  type?: "quiz";
}

interface StepperProps {
  steps: StepperStep[];
  currentStep: number; // 0-indexed
  onStepClick?: (index: number) => void;
  className?: string;
}

export function Stepper({
  steps,
  currentStep,
  onStepClick,
  className,
}: StepperProps) {
  const progressRatio = steps.length > 1 ? currentStep / (steps.length - 1) : 0;

  return (
    <div className={cn("w-full select-none", className)}>
      <div className="relative">
        {/* Track background */}
        <div className="absolute top-[17px] left-[18px] right-[18px] h-0.5 bg-fill-muted" />

        {/* Track fill */}
        <div
          className="absolute top-[17px] left-[18px] h-0.5 bg-primary transition-all duration-500 ease-in-out"
          style={{ width: `calc(${progressRatio} * (100% - 36px))` }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isDone =
              step.isCompleted !== undefined
                ? step.isCompleted
                : index < currentStep;
            const isCurrent = index === currentStep;
            const isClickable = isDone && !!onStepClick;

            if (step.type === "quiz") {
              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex flex-col items-center gap-2.5",
                    isClickable && "cursor-pointer",
                  )}
                  onClick={() => isClickable && onStepClick?.(index)}
                >
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                      isDone && "bg-green-600 border-green-600",
                      isDone && isClickable && "hover:opacity-80",
                      isCurrent &&
                        "bg-primary border-primary shadow-[0_0_0_4px_rgba(61,0,107,0.14)]",
                      !isDone && !isCurrent && "bg-white border-border-strong",
                    )}
                  >
                    <Trophy
                      size={16}
                      className={cn(
                        isDone && "text-white",
                        isCurrent && "text-white",
                        !isDone && !isCurrent && "text-muted-contrast",
                      )}
                    />
                  </div>
                  {/* Quiz step always shows label */}
                  <span
                    className={cn(
                      "font-body text-xs font-medium text-center whitespace-nowrap transition-colors duration-300",
                      isDone && "text-green-600",
                      isCurrent && "text-foreground",
                      !isDone && !isCurrent && "text-muted-contrast",
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={step.id}
                className={cn(
                  "flex flex-col items-center gap-2.5",
                  isClickable && "cursor-pointer",
                )}
                onClick={() => isClickable && onStepClick?.(index)}
              >
                {/* Circle */}
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    isDone && "bg-primary border-primary",
                    isDone && isClickable && "hover:opacity-80",
                    isCurrent &&
                      "bg-primary border-primary shadow-[0_0_0_4px_rgba(61,0,107,0.14)]",
                    !isDone && !isCurrent && "bg-white border-border-strong",
                  )}
                >
                  {isDone ? (
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span
                      className={cn(
                        "font-heading font-bold text-sm leading-none",
                        isCurrent ? "text-white" : "text-muted-contrast",
                      )}
                    >
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Label — only shown for current step */}
                {isCurrent && (
                  <span className="font-body text-xs font-medium text-center whitespace-nowrap text-foreground">
                    {step.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
