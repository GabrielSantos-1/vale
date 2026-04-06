import { Gauge, Rocket } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/core/card";

type PlanCardProps = {
  name: string;
  speedLabel: string;
  benefits: string[];
  usagePercent: number;
  usageLabel: string;
};

export function PlanCard({
  name,
  speedLabel,
  benefits,
  usagePercent,
  usageLabel,
}: PlanCardProps) {
  const safePercent = Math.max(0, Math.min(usagePercent, 100));

  return (
    <Card className="h-full hover:border-border-strong">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Rocket className="h-5 w-5 text-accent" aria-hidden="true" />
          Meu Plano
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-secondary">Plano atual</p>
            <p className="text-base font-semibold text-primary">{name}</p>
          </div>
          <div className="rounded-md border border-border bg-surface-secondary px-3 py-2 text-right">
            <p className="text-xs uppercase tracking-[0.12em] text-muted">Velocidade</p>
            <p className="text-sm font-semibold text-primary">{speedLabel}</p>
          </div>
        </div>

        <ul className="space-y-2 text-sm text-secondary">
          {benefits.map((benefit) => (
            <li key={benefit} className="inline-flex items-center gap-2">
              <Gauge className="h-4 w-4 text-accent" aria-hidden="true" />
              {benefit}
            </li>
          ))}
        </ul>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-secondary">
            <span>Consumo</span>
            <span>{safePercent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-secondary">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${safePercent}%` }}
            />
          </div>
          <p className="text-xs text-muted">{usageLabel}</p>
        </div>
      </CardContent>
    </Card>
  );
}
