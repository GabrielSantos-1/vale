import Link from "next/link";

import { Button } from "@/components/ui/core/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/core/card";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

type FaqPreviewProps = {
  items: FaqItem[];
};

export function FaqPreview({ items }: FaqPreviewProps) {
  return (
    <section className="space-y-6 md:space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
            Dúvidas
          </p>

          <h2 className="text-2xl font-semibold text-primary md:text-3xl">
            Perguntas frequentes
          </h2>

          <p className="max-w-2xl text-sm leading-6 text-secondary md:text-base">
            Respostas rápidas para reduzir dúvida, aumentar confiança e facilitar a decisão.
          </p>
        </div>

        <Button asChild variant="ghost">
          <Link href="/suporte">Ver suporte</Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((faq) => (
          <Card key={faq.id} className="rounded-[28px] border-border public-card">
            <CardHeader>
              <CardTitle className="text-lg leading-7">
                {faq.question}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-sm leading-6 text-secondary">
                {faq.answer}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
