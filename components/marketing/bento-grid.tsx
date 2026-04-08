import * as React from "react";
import { cn } from "@/lib/cn";

export interface BentoItem {
  title: string;
  description: string;
  icon?: React.ReactNode;
  span?: "normal" | "wide" | "tall";
}

export interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  items: BentoItem[];
  className?: string;
  cardClassName?: string;
}

const spanClasses: Record<string, string> = {
  normal: "",
  wide: "md:col-span-2",
  tall: "md:row-span-2",
};

export function BentoGrid({ items, className, cardClassName }: BentoGridProps) {
  return (
    <div
      className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", className)}
    >
      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            "public-card rounded-[var(--radius-md)] p-6",
            spanClasses[item.span ?? "normal"],
            cardClassName
          )}
        >
          {item.icon ? (
            <div className="mb-3 text-accent" aria-hidden="true">
              {item.icon}
            </div>
          ) : null}
          <h3 className="text-base font-semibold text-primary">{item.title}</h3>
          <p className="mt-1 text-sm text-secondary">{item.description}</p>
        </div>
      ))}
    </div>
  );
}
