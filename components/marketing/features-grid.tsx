import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/core/card";

type FeatureItem = {
  title: string;
  description: string;
};

type FeaturesGridProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  items?: FeatureItem[];
};

const defaultItems: FeatureItem[] = [
  {
    title: "Internet estável",
    description:
      "Planos pensados para navegação, trabalho, estudo e consumo de mídia com mais previsibilidade e menos atrito.",
  },
  {
    title: "Cobertura consultável",
    description:
      "Consulta rápida por CEP, cidade ou bairro para reduzir dúvida antes da contratação.",
  },
  {
    title: "Status transparente",
    description:
      "Comunicação mais clara sobre manutenção, incidentes e normalização da rede.",
  },
];

export function FeaturesGrid({
  eyebrow = "Diferenciais",
  title = "Uma experiência mais clara do início ao suporte",
  description = "Estruture a jornada comercial e operacional com leitura rápida, percepção premium e melhor confiança do cliente.",
  items = defaultItems,
}: FeaturesGridProps) {
  return (
    <section className="space-y-6 md:space-y-8">
      <div className="max-w-3xl space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
          {eyebrow}
        </p>

        <h2 className="text-2xl font-semibold tracking-tight text-primary md:text-3xl">
          {title}
        </h2>

        <p className="text-sm leading-6 text-secondary md:text-base">
          {description}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Card
            key={item.title}
            className="h-full rounded-[28px] border-border public-card"
          >
            <CardHeader className="space-y-3">
              <div className="inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Destaque
              </div>

              <CardTitle className="text-xl leading-7">{item.title}</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-sm leading-6 text-secondary">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
