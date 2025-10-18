"use client";

import { Spinner } from "./spinner";
import { cn } from "@/shared/lib/utils";

interface GlobalSpinnerProps {
  isVisible: boolean;
  message?: string;
  className?: string;
}

export function GlobalSpinner({ 
  isVisible, 
  message = "Загрузка...", 
  className 
}: GlobalSpinnerProps) {
  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b",
        className
      )}
    >
      <div className="flex items-center justify-center py-3 px-4">
        <div className="flex items-center gap-3">
          <Spinner className="size-5" />
          <span className="text-sm font-medium">{message}</span>
        </div>
      </div>
    </div>
  );
}
