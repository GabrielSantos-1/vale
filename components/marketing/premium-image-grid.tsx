import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/core/button";
import { Card, CardContent } from "@/components/ui/core/card";
import { cn } from "@/lib/cn";

export type PremiumVisualItem = {
  eyebrow: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  href?: string;
  ctaLabel?: string;
};

type PremiumImageGridProps = {
  eyebrow: string;
  title: string;
  description: string;
  items: PremiumVisualItem[];
  className?: string;
};

export function PremiumImageGrid({
  eyebrow,
  title,
  description,
  items,
  className,
}: PremiumImageGridProps) {
  return (
    <section className={cn("space-y-6 md:space-y-8", className)}>
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
            className={cn(
              "group relative flex h-full flex-col overflow-hidden rounded-[32px] border-border public-card transition-all duration-300",
              "hover:-translate-y-1 hover:shadow-soft-lg"
            )}
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={item.imageSrc}
                alt={item.imageAlt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(47,158,68,0.18),transparent_26%),radial-gradient(circle_at_80%_18%,rgba(14,165,233,0.16),transparent_24%),linear-gradient(180deg,rgba(4,8,14,0.04),rgba(4,8,14,0.74))]" />
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/85 to-transparent" />
            </div>

            <CardContent className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {item.eyebrow}
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold tracking-tight text-primary">
                  {item.title}
                </h3>
                <p className="text-sm leading-6 text-secondary">
                  {item.description}
                </p>
              </div>

              {item.href ? (
                <div className="mt-auto pt-1">
                  <Button asChild variant="secondary" className="w-full sm:w-auto">
                    <Link href={item.href}>{item.ctaLabel ?? "Ver detalhes"}</Link>
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
