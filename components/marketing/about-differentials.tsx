import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/core/card";
import { COMPANY_PROFILE } from "@/lib/constants/company";

export function AboutDifferentials() {
  return (
    <section className="space-y-6 md:space-y-8">
      <div className="max-w-3xl space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
          Diferenciais
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-primary md:text-3xl">
          Como a Verde Vale Connect atende no dia a dia
        </h2>
        <p className="text-sm leading-6 text-secondary md:text-base">
          Atendimento próximo, informação clara e operação estável para clientes residenciais e empresas.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {COMPANY_PROFILE.differentials.map((item) => (
          <Card key={item.title} className="rounded-[24px] border-border public-card">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-secondary">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-[28px] border-border public-card">
        <CardHeader className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
            Atuação regional
          </p>
          <CardTitle className="text-2xl tracking-tight text-primary">
            Presença regional com cobertura e status públicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2.5 text-sm leading-6 text-secondary">
            {COMPANY_PROFILE.regionalScope.map((point) => (
              <li key={point} className="flex items-start gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}

export default AboutDifferentials;


