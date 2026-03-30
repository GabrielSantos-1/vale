import { Card, CardContent } from "@/components/ui/core/card";
import { COMPANY_PROFILE } from "@/lib/constants/company";

export function AboutMetrics() {
  return (
    <section aria-label="Métricas institucionais" className="space-y-4">
      <div className="max-w-3xl space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-primary md:text-3xl">
          Dados institucionais em leitura direta
        </h2>
        <p className="text-sm leading-6 text-secondary md:text-base">
          Informações objetivas para apoiar decisão de clientes e parceiros.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {COMPANY_PROFILE.metrics.map((metric) => (
          <Card key={metric.label} className="rounded-[24px] border-border public-card">
            <CardContent className="space-y-2 p-5 sm:p-6">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                {metric.label}
              </p>
              <p className="text-2xl font-semibold tracking-tight text-primary">
                {metric.value}
              </p>
              <p className="text-sm leading-6 text-secondary">{metric.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default AboutMetrics;
