import * as React from "react";
import { cn } from "@/lib/cn";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:
    "border border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success-text)]",
  success:
    "border border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success-text)]",
  warning:
    "border border-[var(--warning-border)] bg-[var(--warning-bg)] text-[var(--warning-text)]",
  danger:
    "border border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-text)]",
  info:
    "border border-[var(--info-border)] bg-[var(--info-bg)] text-[var(--info-text)]",
  neutral:
    "border border-[var(--neutral-border)] bg-[var(--neutral-bg)] text-[var(--neutral-text)]",
};

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-[0.02em]",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
