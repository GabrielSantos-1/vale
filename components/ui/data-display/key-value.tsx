import * as React from "react";
import { cn } from "@/lib/cn";

export interface KeyValueProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  variant?: "default" | "compact" | "stacked";
}

export function KeyValue({
  label,
  value,
  variant = "default",
  className,
  ...props
}: KeyValueProps) {
  if (variant === "stacked") {
    return (
      <div className={cn("flex flex-col gap-1", className)} {...props}>
        <span className="text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </span>
        <span className="text-sm text-primary">{value}</span>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("inline-flex items-center gap-2", className)} {...props}>
        <span className="text-xs text-muted">{label}</span>
        <span className="text-sm text-primary">{value}</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)} {...props}>
      <span className="text-sm text-muted shrink-0">{label}</span>
      <span className="text-sm text-primary">{value}</span>
    </div>
  );
}
