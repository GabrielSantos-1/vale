import * as React from "react";
import { cn } from "@/lib/cn";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  id?: string;
}

export function Section({ children, className, id, ...props }: SectionProps) {
  return (
    <section id={id} className={cn("py-16 md:py-24", className)} {...props}>
      {children}
    </section>
  );
}
