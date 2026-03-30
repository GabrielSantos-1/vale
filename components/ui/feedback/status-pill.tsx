import * as React from "react";
import { cn } from "@/lib/cn";

type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

export interface StatusPillProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  label: string;
  tone?: StatusTone;
}

const toneClasses: Record<StatusTone, string> = {
  neutral:
    "border border-[var(--neutral-border)] bg-[var(--neutral-bg)] text-[var(--neutral-text)]",
  success:
    "border border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success-text)]",
  warning:
    "border border-[var(--warning-border)] bg-[var(--warning-bg)] text-[var(--warning-text)]",
  danger:
    "border border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-text)]",
  info:
    "border border-[var(--info-border)] bg-[var(--info-bg)] text-[var(--info-text)]",
};

export function StatusPill({
  label,
  tone = "neutral",
  className,
  ...props
}: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]",
        toneClasses[tone],
        className
      )}
      {...props}
    >
      {label}
    </span>
  );
}
