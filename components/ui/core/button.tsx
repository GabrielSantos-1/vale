import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/cn";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "border border-transparent bg-accent text-[var(--accent-foreground)] shadow-soft hover:brightness-[1.04] hover:shadow-soft-lg",
  secondary:
    "border border-border bg-surface-secondary text-primary hover:border-border-strong hover:bg-surface-tertiary",
  outline:
    "border border-border bg-transparent text-primary hover:border-border-strong hover:bg-surface-secondary",
  ghost:
    "border border-transparent bg-transparent text-secondary hover:bg-surface-secondary hover:text-primary",
  danger:
    "border border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-text)] hover:brightness-[1.03]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 rounded-[var(--radius-sm)] px-3 text-sm",
  md: "h-11 rounded-[var(--radius-md)] px-4 text-sm",
  lg: "h-12 rounded-[var(--radius-md)] px-5 text-base",
  icon: "h-10 w-10 rounded-[var(--radius-md)] p-0",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      asChild = false,
      isLoading = false,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const classes = cn(
      "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold",
      "transition-all duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
      "disabled:pointer-events-none disabled:opacity-50",
      "active:scale-[0.99]",
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    if (asChild) {
      return (
        <Slot ref={ref as never} className={classes} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading ? (
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";