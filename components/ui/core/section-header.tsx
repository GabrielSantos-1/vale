import * as React from "react";
import { cn } from "@/lib/cn";

export interface SectionHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export function SectionHeader({
  title,
  description,
  badge,
  actions,
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
        className
      )}
      {...props}
    >
      <div className="min-w-0 space-y-3">
        {badge ? <div>{badge}</div> : null}

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-primary md:text-3xl">
            {title}
          </h1>

          {description ? (
            <p className="max-w-2xl text-sm leading-6 text-secondary md:text-base">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}