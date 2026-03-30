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
  const gradientId = React.useId();
  const lineId = React.useId();

  const resolvedMax =
    maxValue ?? Math.max(...data.map((item) => item.value), 1);

  const resolvedData =
    data.length === 0 ? [] : data;

  const points = resolvedData
    .map((item, index) => {
      const x =
        resolvedData.length === 1 ? 50 : (index / (resolvedData.length - 1)) * 100;
      const y = 100 - (item.value / resolvedMax) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <section
      className={cn(
        "rounded-[24px] border border-border bg-surface shadow-soft",
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-3 border-b border-border/80 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-primary">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-secondary">{description}</p>
          ) : null}
        </div>

        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </div>

      <div className="p-5">
        {resolvedData.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-border bg-white/80 px-6 py-12 text-center">
            <p className="text-sm text-muted">Sem dados para exibir.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-72 rounded-[24px] border border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(255,255,255,0.4))] p-4">
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="h-full w-full"
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="rgba(16,185,129,0.28)" />
                    <stop offset="100%" stopColor="rgba(16,185,129,0.02)" />
                  </linearGradient>

                  <linearGradient id={lineId} x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="rgba(34,211,238,0.95)" />
                    <stop offset="100%" stopColor="rgba(16,185,129,0.95)" />
                  </linearGradient>
                </defs>

                {[85, 60, 35, 10].map((y) => (
                  <polyline
                    key={y}
                    fill="none"
                    stroke="rgba(148,163,184,0.22)"
                    strokeWidth="0.4"
                    points={`0,${y} 100,${y}`}
                  />
                ))}

                <polygon
                  fill={`url(#${gradientId})`}
                  points={`0,100 ${points} 100,100`}
                />

                <polyline
                  fill="none"
                  stroke={`url(#${lineId})`}
                  strokeWidth="1.2"
                  points={points}
                />

                {resolvedData.map((item, index) => {
                  const x =
                    resolvedData.length === 1
                      ? 50
                      : (index / (resolvedData.length - 1)) * 100;
                  const y = 100 - (item.value / resolvedMax) * 100;

                  return (
                    <circle
                      key={`${item.label}-${index}`}
                      cx={x}
                      cy={y}
                      r="1.25"
                      fill="rgba(255,255,255,0.95)"
                      stroke="rgba(16,185,129,0.95)"
                      strokeWidth="0.7"
                    />
                  );
                })}
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
              {resolvedData.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className="rounded-2xl border border-border bg-white/80 px-3 py-3 backdrop-blur-sm"
                >
                  <p className="text-[11px] uppercase tracking-[0.12em] text-secondary">
                    {item.label}
                  </p>
                  <p className="mt-1 text-base font-semibold text-primary">
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
