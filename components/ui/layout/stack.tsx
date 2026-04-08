import * as React from "react";
import { cn } from "@/lib/cn";

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "row" | "col";
  gap?: "xs" | "sm" | "md" | "lg" | "xl";
  wrap?: boolean;
}

const gapClasses: Record<string, string> = {
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

export function Stack({
  children,
  className,
  direction = "col",
  gap = "md",
  wrap = false,
  ...props
}: StackProps) {
  return (
    <div
      className={cn(
        "flex",
        direction === "col" ? "flex-col" : "flex-row",
        wrap && "flex-wrap",
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
