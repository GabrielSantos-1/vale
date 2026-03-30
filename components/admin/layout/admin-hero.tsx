import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/core/badge";

type AdminHeroProps = {
  badge: string;
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
  imageSrc?: string;
};

export function AdminHero({
  badge,
  title,
  description,
  actions,
  className,
  imageSrc = "/images/admin/hero-fiber.webp",
}: AdminHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-white/15 bg-slate-950/85 p-6",
        "shadow-[0_24px_70px_rgba(2,6,23,0.45)]",
        className
      )}
      style={{
        backgroundImage: `url('${imageSrc}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(2,6,23,0.92),rgba(2,6,23,0.55))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.28),transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(34,197,94,0.24),transparent_50%)]" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
      </div>

      <div className="relative flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between text-white">
        <div className="space-y-3">
          <Badge className="w-fit border border-white/20 bg-white/10 text-white">
            {badge}
          </Badge>

          <div className="space-y-3">
            <h2 className="max-w-3xl text-2xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              {description}
            </p>
          </div>
        </div>

        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </section>
  );
}
