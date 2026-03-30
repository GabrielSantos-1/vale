import * as React from "react";
import { cn } from "@/lib/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-11 w-full min-w-0 rounded-2xl border border-border bg-surface px-4 py-3",
          "text-sm text-primary placeholder:text-muted placeholder:opacity-100",
          "transition-[border-color,box-shadow,background-color] duration-200 outline-none",
          "focus:border-[color:var(--ring)] focus:ring-2 focus:ring-[color:rgba(147,197,253,0.28)]",
          "aria-[invalid=true]:border-danger aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-[color:rgba(220,38,38,0.12)]",
          "disabled:cursor-not-allowed disabled:bg-surface-secondary disabled:text-secondary disabled:placeholder:text-muted disabled:opacity-80",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
