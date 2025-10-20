"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  steps: string[];
  currentStep: string;
}

export function ProgressBar({ steps, currentStep }: ProgressBarProps) {
  const currentStepIndex = steps.indexOf(currentStep);

  return (
    <div className="flex items-center w-full">
      {steps.map((step, index) => {
        const isCompleted = index < currentStepIndex;
        const isCurrent = index === currentStepIndex;

        return (
          <div key={step} className="flex items-center w-full">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                  isCompleted
                    ? "bg-primary border-primary"
                    : isCurrent
                      ? "bg-primary border-primary"
                      : "bg-card border-foreground",
                )}
              >
                {isCompleted && (
                  <svg
                    className="w-4 h-4 text-background"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <div className="text-xs font-mono uppercase mt-2 text-center">
                {step.replace("_", " ")}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-grow h-1 mx-2 transition-all duration-300",
                  isCompleted ? "bg-primary" : "bg-foreground",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
