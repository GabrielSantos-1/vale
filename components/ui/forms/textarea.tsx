import * as React from "react";
import { cn } from "@/lib/cn";

export type TextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[140px] w-full min-w-0 rounded-2xl border border-border bg-surface px-4 py-3",
          "text-sm leading-6 text-primary placeholder:text-muted placeholder:opacity-100",
          "resize-y transition-[border-color,box-shadow,background-color] duration-200 outline-none",
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

Textarea.displayName = "Textarea";
