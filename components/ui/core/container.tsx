import * as React from "react";
import { cn } from "@/lib/cn";

type ContainerSize = "default" | "wide" | "narrow" | "full";
type ContainerTag = "div" | "section" | "main" | "article";

export interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
  size?: ContainerSize;
  as?: ContainerTag;
}

const sizeClasses: Record<ContainerSize, string> = {
  default: "max-w-7xl",
  wide: "max-w-[1440px]",
  narrow: "max-w-5xl",
  full: "max-w-none",
};

export function Container({
  className,
  size = "default",
  as = "div",
  ...props
}: ContainerProps) {
  const Comp = as;

  return (
    <Comp
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}