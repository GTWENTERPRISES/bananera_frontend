"use client";

import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface FieldFeedbackProps {
  error?: string;
  touched?: boolean;
  isValid?: boolean;
  successMessage?: string;
  infoMessage?: string;
  className?: string;
}

export function FieldFeedback({
  error,
  touched,
  isValid,
  successMessage,
  infoMessage,
  className,
}: FieldFeedbackProps) {
  if (error && touched) {
    return (
      <p className={cn("text-xs text-red-600 flex items-center gap-1 mt-1", className)}>
        <AlertCircle className="h-3 w-3 flex-shrink-0" />
        <span>{error}</span>
      </p>
    );
  }

  if (isValid && touched && successMessage) {
    return (
      <p className={cn("text-xs text-green-600 flex items-center gap-1 mt-1", className)}>
        <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
        <span>{successMessage}</span>
      </p>
    );
  }

  if (infoMessage) {
    return (
      <p className={cn("text-xs text-muted-foreground flex items-center gap-1 mt-1", className)}>
        <Info className="h-3 w-3 flex-shrink-0" />
        <span>{infoMessage}</span>
      </p>
    );
  }

  return null;
}

export function getInputClassName(
  errors: Record<string, string>,
  touched: Record<string, boolean>,
  field: string,
  value: string | number | undefined
): string {
  const hasError = errors[field] && touched[field];
  const isValidField = touched[field] && !errors[field] && value !== undefined && value !== "";

  if (hasError) return "border-red-500 focus-visible:ring-red-500";
  if (isValidField) return "border-green-500 focus-visible:ring-green-500";
  return "";
}
