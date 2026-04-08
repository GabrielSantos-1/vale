import * as React from "react";
import { cn } from "@/lib/cn";

export interface InfoListItem {
  label: string;
  value: React.ReactNode;
}

export interface InfoListProps extends React.HTMLAttributes<HTMLDivElement> {
  items: InfoListItem[];
  direction?: "vertical" | "horizontal";
}

export function InfoList({
  items,
  direction = "vertical",
  className,
  ...props
}: InfoListProps) {
  return (
    <div className={cn("rounded-[var(--radius-md)]", className)} {...props}>
      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            "flex gap-3 py-3",
            direction === "horizontal" && "gap-8",
            index > 0 && "border-t border-border",
            direction === "horizontal" && "flex-1"
          )}
        >
          <span className="text-sm text-muted shrink-0">{item.label}</span>
          <span className="text-sm text-primary">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
