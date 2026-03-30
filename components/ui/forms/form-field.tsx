import * as React from "react";
import { cn } from "@/lib/cn";
import { Label } from "@/components/ui/forms/label";

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  label?: string;
  hint?: string | null;
  error?: string | null;
  required?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  labelClassName?: string;
  contentClassName?: string;
}

export function FormField({
  id,
  label,
  hint,
  error,
  required = false,
  disabled = false,
  children,
  className,
  labelClassName,
  contentClassName,
  ...props
}: FormFieldProps) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  const child = React.isValidElement(children)
    ? React.cloneElement(
        children as React.ReactElement<Record<string, unknown>>,
        {
          id,
          disabled:
            (children.props as Record<string, unknown>).disabled ?? disabled,
          required:
            (children.props as Record<string, unknown>).required ?? required,
          "aria-invalid": error ? true : undefined,
          "aria-describedby": [
            (children.props as Record<string, unknown>)["aria-describedby"],
            describedBy,
          ]
            .filter(Boolean)
            .join(" ") || undefined,
          "aria-errormessage": error ? errorId : undefined,
        }
      )
    : children;

  return (
    <div
      className={cn("space-y-2.5", disabled && "opacity-85", className)}
      {...props}
    >
      {label ? (
        <div className="flex items-center gap-2">
          <Label htmlFor={id} className={labelClassName}>
            {label}
            {required ? (
              <>
                <span className="ml-1 text-danger" aria-hidden="true">
                  *
                </span>
                <span className="sr-only"> obrigatório</span>
              </>
            ) : null}
          </Label>
        </div>
      ) : null}

      <div className={contentClassName}>{child}</div>

      {hint ? (
        <p id={hintId} className="text-xs leading-5 text-secondary md:text-sm">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p
          id={errorId}
          className="text-xs font-medium leading-5 text-danger md:text-sm"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
