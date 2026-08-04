import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  htmlFor?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export function FormField({
  className,
  label,
  htmlFor,
  error,
  helperText,
  required,
  children,
  ...props
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5 w-full", className)} {...props}>
      {label && (
        <div className="flex items-center justify-between">
          <Label htmlFor={htmlFor} className="flex items-center gap-1">
            {label}
            {required && <span className="text-destructive">*</span>}
          </Label>
        </div>
      )}

      {children}

      {error ? (
        <p className="text-xs text-destructive font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
}

export function FormSection({
  className,
  title,
  description,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
  description?: string;
}) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {(title || description) && (
        <div className="border-b border-border/60 pb-3">
          {title && (
            <h4 className="text-base font-bold text-foreground">{title}</h4>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-3">{children}</div>
    </div>
  );
}
