import * as React from "react";
import { cn } from "@/lib/cn";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-[var(--radius-lg)] border border-dashed border-border py-16 px-6",
        "text-center",
        className
      )}
      role="status"
      {...props}
    >
      {icon ? (
        <div className="text-muted opacity-60" aria-hidden="true">
          {icon}
        </div>
      ) : (
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface-secondary text-muted"
          aria-hidden="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3v12" />
            <circle cx="12" cy="18" r="1" />
          </svg>
        </div>
      )}
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-primary">{title}</p>
        {description ? (
          <p className="text-sm text-secondary">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
