import * as React from "react";
import { cn } from "@/lib/cn";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  placeholder?: string;
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, placeholder, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "flex h-11 w-full min-w-0 appearance-none rounded-2xl border border-border bg-surface px-4 py-3 pr-10",
          "text-sm text-primary",
          "transition-[border-color,box-shadow,background-color] duration-200 outline-none",
          "focus:border-[color:var(--ring)] focus:ring-2 focus:ring-[color:rgba(147,197,253,0.28)]",
          "aria-[invalid=true]:border-danger aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-[color:rgba(220,38,38,0.12)]",
          "disabled:cursor-not-allowed disabled:bg-surface-secondary disabled:text-secondary disabled:opacity-80",
          className
        )}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        ) : null}
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";
