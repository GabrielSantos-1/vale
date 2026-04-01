import Link from "next/link";
import { Button } from "@/components/ui/core/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/core/card";
import { PUBLIC_CONTACT_ACTIONS } from "@/lib/constants/contact";

export function AboutCta() {
  return (
    <Card className="rounded-[28px] border-border public-card-strong">
      <CardHeader className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
          Próximos passos
        </p>
        <CardTitle className="text-2xl tracking-tight text-primary md:text-3xl">
          Consulte cobertura e fale com nosso atendimento
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <p className="max-w-3xl text-sm leading-6 text-secondary md:text-base">
          Se você está avaliando contratação de internet fibra, comece pela cobertura.
          Para suporte ou orientação comercial, use os canais oficiais de atendimento.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href={PUBLIC_CONTACT_ACTIONS.coverage.href}>
              {PUBLIC_CONTACT_ACTIONS.coverage.label}
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href={PUBLIC_CONTACT_ACTIONS.support.href}>
              {PUBLIC_CONTACT_ACTIONS.support.label}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default AboutCta;

