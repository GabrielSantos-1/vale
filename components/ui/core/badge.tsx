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
    "border border-emerald-200 bg-emerald-50 text-emerald-700",
  success:
    "border border-emerald-200 bg-emerald-50 text-emerald-700",
  warning:
    "border border-amber-200 bg-amber-50 text-amber-700",
  danger:
    "border border-red-200 bg-red-50 text-red-700",
  info:
    "border border-blue-200 bg-blue-50 text-blue-700",
  neutral:
    "border border-slate-200 bg-slate-100 text-slate-700",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-[0.02em] whitespace-nowrap",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}