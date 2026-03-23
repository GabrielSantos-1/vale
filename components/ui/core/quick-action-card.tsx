import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export interface QuickActionCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  href?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
}

function QuickActionCardContent({
  title,
  description,
  icon,
  actionLabel,
  className,
}: Omit<QuickActionCardProps, "href"> & { className?: string }) {
  return (
    <div
      className={cn(
        "group rounded-2xl border border-white/10 bg-white/[0.03] p-5",
        "transition-all duration-200 hover:border-white/20 hover:bg-white/[0.05]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-200">
            {icon ?? <span className="text-sm font-semibold">→</span>}
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">{title}</h3>
            {description && (
              <p className="text-sm leading-6 text-slate-400">{description}</p>
            )}
          </div>
        </div>

        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 transition group-hover:text-emerald-300">
          {actionLabel || "Acessar"}
        </span>
      </div>
    </div>
  );
}

export function QuickActionCard({
  href,
  title,
  description,
  icon,
  actionLabel,
  className,
  ...props
}: QuickActionCardProps) {
  if (href) {
    return (
      <Link href={href} className="block" {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        <QuickActionCardContent
          title={title}
          description={description}
          icon={icon}
          actionLabel={actionLabel}
          className={className}
        />
      </Link>
    );
  }

  return (
    <QuickActionCardContent
      title={title}
      description={description}
      icon={icon}
      actionLabel={actionLabel}
      className={className}
    />
  );
}