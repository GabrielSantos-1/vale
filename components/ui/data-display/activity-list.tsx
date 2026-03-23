import * as React from "react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/core/badge";

type ActivityTone = "default" | "success" | "warning" | "danger" | "info" | "neutral";

export interface ActivityItem {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  tone?: ActivityTone;
  meta?: string;
  icon?: React.ReactNode;
}

export interface ActivityListProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  items: ActivityItem[];
  emptyMessage?: string;
}

function getBadgeVariant(tone: ActivityTone = "neutral"): ActivityTone {
  return tone;
}

export function ActivityList({
  title = "Atividades recentes",
  description,
  items,
  emptyMessage = "Nenhuma atividade disponível no momento.",
  className,
  ...props
}: ActivityListProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-surface shadow-soft",
        className
      )}
      {...props}
    >
      <div className="border-b border-white/10 p-5">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {description && (
          <p className="mt-1 text-sm leading-6 text-slate-400">
            {description}
          </p>
        )}
      </div>

      <div className="p-5">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-6 py-10 text-center">
            <p className="text-sm text-slate-400">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <article
                key={item.id}
                className={cn(
                  "rounded-2xl border border-white/10 bg-white/[0.03] p-4",
                  "transition hover:border-white/20 hover:bg-white/[0.05]"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-300">
                    {item.icon ?? (
                      <span className="text-sm font-semibold">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-white sm:text-base">
                          {item.title}
                        </h3>

                        {item.description && (
                          <p className="mt-1 text-sm leading-6 text-slate-400">
                            {item.description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {item.meta && (
                          <Badge variant={getBadgeVariant(item.tone)}>
                            {item.meta}
                          </Badge>
                        )}

                        {item.timestamp && (
                          <span className="text-xs whitespace-nowrap text-slate-500">
                            {item.timestamp}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}