import * as React from "react";
import { cn } from "@/lib/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }: InputProps & { className?: string }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-11 w-full rounded-2xl border border-border bg-surface px-4 py-3",
          "text-sm text-primary placeholder:text-muted",
          "transition-all duration-200 outline-none",
          "focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
          "aria-invalid:border-red-400 aria-invalid:ring-2 aria-invalid:ring-red-100",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";