import * as React from "react";
import { cn } from "@/lib/cn";

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: number;
  gap?: "sm" | "md" | "lg";
}

const gapClasses: Record<string, string> = {
  sm: "gap-3",
  md: "gap-5",
  lg: "gap-7",
};

export function Grid({
  children,
  className,
  cols = 1,
  gap = "md",
  ...props
}: GridProps) {
  return (
    <div
      className={cn(
        "grid",
        gapClasses[gap],
        cols === 1 && "grid-cols-1",
        cols === 2 && "grid-cols-1 md:grid-cols-2",
        cols === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        cols === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
