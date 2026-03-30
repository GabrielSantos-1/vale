import * as React from "react";
import { cn } from "@/lib/cn";

type StatCardTone = "default" | "info" | "warning" | "success" | "danger";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: number | string;
  description?: string;
  icon?: React.ReactNode;
  tone?: StatCardTone;
}

const toneClasses: Record<
  StatCardTone,
  {
    value: string;
    icon: string;
    glow: string;
  }
> = {
  default: {
    value: "text-primary",
    icon: "text-slate-300 border-white/10 bg-white/5",
    glow: "from-white/5 to-transparent",
  },
  info: {
    value: "text-cyan-700 dark:text-cyan-300",
    icon: "text-cyan-300 border-cyan-400/20 bg-cyan-400/10",
    glow: "from-cyan-400/10 to-transparent",
  },
  warning: {
    value: "text-amber-700 dark:text-amber-300",
    icon: "text-amber-300 border-amber-400/20 bg-amber-400/10",
    glow: "from-amber-400/10 to-transparent",
  },
  success: {
    value: "text-emerald-700 dark:text-emerald-300",
    icon: "text-emerald-300 border-emerald-400/20 bg-emerald-400/10",
    glow: "from-emerald-400/10 to-transparent",
  },
  danger: {
    value: "text-red-700 dark:text-red-300",
    icon: "text-red-300 border-red-400/20 bg-red-400/10",
    glow: "from-red-400/10 to-transparent",
  },
};

export function StatCard({
  label,
  value,
  description,
  icon,
  tone = "default",
  className,
  ...props
}: StatCardProps) {
  const toneClass = toneClasses[tone];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[24px] border border-border bg-surface p-5 shadow-soft",
        "transition-all duration-200 hover:border-border-strong hover:shadow-[0_18px_50px_rgba(2,6,23,0.16)]",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-100",
          toneClass.glow
        )}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-sm font-medium text-secondary">{label}</p>
          <p className={cn("text-3xl font-bold tracking-tight", toneClass.value)}>
            {value}
          </p>
        </div>

        {icon ? (
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-2xl border backdrop-blur-sm",
              toneClass.icon
            )}
          >
            {icon}
          </div>
        ) : null}
      </div>

      {description ? (
        <p className="relative mt-4 text-sm leading-6 text-secondary">
          {description}
        </p>
      ) : null}
    </div>
  );
}
