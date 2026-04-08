import * as React from "react";
import { cn } from "@/lib/cn";

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  size?: "sm" | "md" | "lg";
}

const spinnerSizes: Record<string, string> = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function LoadingState({
  label,
  size = "md",
  className,
  ...props
}: LoadingStateProps) {
  return (
    <div
      className={cn("flex items-center justify-center gap-3 py-12", className)}
      role="status"
      aria-live="polite"
      {...props}
    >
      <span
        className={cn(
          "animate-spin rounded-full border-2 border-current border-t-transparent text-muted",
          spinnerSizes[size]
        )}
        aria-hidden="true"
      />
      {label ? (
        <span className="text-sm text-secondary">{label}</span>
      ) : null}
      <span className="sr-only">
        {label ?? "Carregando..."}
      </span>
    </div>
  );
}
