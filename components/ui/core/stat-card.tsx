import * as React from "react";
import { cn } from "@/lib/cn";

export interface StatCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: number | string;
  description?: string;
  icon?: React.ReactNode;
  accent?: string;
}

export function StatCard({
  label,
  value,
  description,
  icon,
  accent = "text-primary",
  className,
  ...props
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface p-5 shadow-soft",
        "transition-all duration-200 hover:border-border-strong",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-sm text-secondary">{label}</p>
          <p className={cn("text-3xl font-bold", accent)}>{value}</p>
        </div>

        {icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface-secondary">
            {icon}
          </div>
        )}
      </div>

      {description && (
        <p className="mt-4 text-sm leading-6 text-secondary">
          {description}
        </p>
      )}
    </div>
  );
}