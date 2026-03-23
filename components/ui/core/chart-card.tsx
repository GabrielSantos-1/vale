import * as React from "react";
import { cn } from "@/lib/cn";

export interface ChartPoint {
  label: string;
  value: number;
}

export interface ChartCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  data: ChartPoint[];
  maxValue?: number;
  rightSlot?: React.ReactNode;
}

export function ChartCard({
  title,
  description,
  data,
  maxValue,
  rightSlot,
  className,
  ...props
}: ChartCardProps) {
  const resolvedMax =
    maxValue ?? Math.max(...data.map((item) => item.value), 1);

  const points = data
    .map((item, index) => {
      const x = data.length === 1 ? 0 : (index / (data.length - 1)) * 100;
      const y = 100 - (item.value / resolvedMax) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
  <section
    className={cn(
      "rounded-2xl border border-border bg-surface shadow-soft",
      className
    )}
    {...props}
  >
    {/* HEADER */}
    <div className="flex items-center justify-between gap-3 border-b border-border p-5">
      <div>
        <h2 className="text-lg font-semibold text-primary">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-secondary">{description}</p>
        )}
      </div>

      {rightSlot && <div>{rightSlot}</div>}
    </div>

    {/* CONTENT */}
    <div className="p-5">
      {data.length === 0 ? (
        <div className="rounded-2xl border border-border border-dashed bg-surface-secondary px-6 py-10 text-center">
          <p className="text-sm text-muted">Sem dados para exibir.</p>
        </div>
      ) : (
        <div className="space-y-4">

          {/* CHART */}
          <div className="h-64 rounded-2xl border border-border bg-surface-secondary p-4">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="h-full w-full"
            >
              <defs>
                <linearGradient id="vv-chart-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgba(34,197,94,0.28)" />
                  <stop offset="100%" stopColor="rgba(34,197,94,0.02)" />
                </linearGradient>
              </defs>

              {/* GRID */}
              <polyline
                fill="none"
                stroke="rgba(148,163,184,0.18)"
                strokeWidth="0.4"
                points="0,85 100,85"
              />
              <polyline
                fill="none"
                stroke="rgba(148,163,184,0.18)"
                strokeWidth="0.4"
                points="0,60 100,60"
              />
              <polyline
                fill="none"
                stroke="rgba(148,163,184,0.18)"
                strokeWidth="0.4"
                points="0,35 100,35"
              />

              {/* AREA */}
              <polygon
                fill="url(#vv-chart-fill)"
                points={`0,100 ${points} 100,100`}
              />

              {/* LINE */}
              <polyline
                fill="none"
                stroke="rgba(34,197,94,0.95)"
                strokeWidth="1.2"
                points={points}
              />
            </svg>
          </div>

          {/* STATS GRID */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {data.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-border bg-surface-secondary px-3 py-2"
              >
                <p className="text-xs uppercase tracking-[0.12em] text-muted">
                  {item.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-primary">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  </section>
  );
}