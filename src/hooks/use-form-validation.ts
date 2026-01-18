"use client";

import { useState, useCallback } from "react";
import type { ZodSchema } from "zod";

export interface FieldState {
  value: string;
  error: string;
  touched: boolean;
  isValid: boolean;
}

export interface UseFormValidationReturn<T extends Record<string, string>> {
  fields: Record<keyof T, FieldState>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isDirty: boolean;
  handleChange: (field: keyof T, value: string) => void;
  handleBlur: (field: keyof T) => void;
  validateField: (field: keyof T, value: string) => string;
  validateAll: () => boolean;
  resetForm: () => void;
  setFieldValue: (field: keyof T, value: string) => void;
  setFieldError: (field: keyof T, error: string) => void;
  getFieldProps: (field: keyof T) => {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    className: string;
  };
  getSelectProps: (field: keyof T) => {
    value: string;
    onValueChange: (value: string) => void;
    className: string;
  };
}

export function useFormValidation<T extends Record<string, string>>(
  schema: ZodSchema,
  initialValues: T
): UseFormValidationReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback(
    (field: keyof T, value: string): string => {
      try {
        const dataToValidate = { ...values, [field]: value };
        const parsed = schema.safeParse(dataToValidate);

        if (!parsed.success) {
          const fieldError = parsed.error.flatten().fieldErrors[field as string];
          if (fieldError && fieldError.length > 0) {
            return String(fieldError[0]);
          }
        }
        return "";
      } catch {
        return "";
      }
    },
    [schema, values]
  );

  const handleChange = useCallback(
    (field: keyof T, value: string) => {
      setValues((prev) => ({ ...prev, [field]: value }));

      if (touched[field as string] || value !== "") {
        const error = validateField(field, value);
        setErrors((prev) => ({ ...prev, [field]: error }));
      }
      setTouched((prev) => ({ ...prev, [field]: true }));
    },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    (field: keyof T) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const error = validateField(field, values[field]);
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [validateField, values]
  );

  const validateAll = useCallback((): boolean => {
    const parsed = schema.safeParse(values);

    if (!parsed.success) {
      const flat = parsed.error.flatten();
      const fieldErrors: Record<string, string> = {};
      const allTouched: Record<string, boolean> = {};

      Object.entries(flat.fieldErrors).forEach(([k, v]) => {
        if (v && v.length) fieldErrors[k] = String(v[0]);
        allTouched[k] = true;
      });

      Object.keys(values).forEach((k) => {
        allTouched[k] = true;
      });

      setErrors(fieldErrors);
      setTouched(allTouched);
      return false;
    }

    setErrors({});
    return true;
  }, [schema, values]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const setFieldValue = useCallback((field: keyof T, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const getInputClassName = (field: keyof T): string => {
    const fieldKey = field as string;
    const hasError = errors[fieldKey] && touched[fieldKey];
    const isValidField = touched[fieldKey] && !errors[fieldKey] && values[field];

    if (hasError) return "border-red-500 focus:ring-red-500";
    if (isValidField) return "border-green-500 focus:ring-green-500";
    return "";
  };

  const getFieldProps = useCallback(
    (field: keyof T) => ({
      value: values[field],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        handleChange(field, e.target.value),
      onBlur: () => handleBlur(field),
      className: getInputClassName(field),
    }),
    [values, handleChange, handleBlur]
  );

  const getSelectProps = useCallback(
    (field: keyof T) => ({
      value: values[field],
      onValueChange: (value: string) => handleChange(field, value),
      className: getInputClassName(field),
    }),
    [values, handleChange]
  );

  const fields = Object.keys(values).reduce(
    (acc, key) => {
      const fieldKey = key as keyof T;
      acc[fieldKey] = {
        value: values[fieldKey],
        error: errors[key] || "",
        touched: touched[key] || false,
        isValid: touched[key] && !errors[key] && !!values[fieldKey],
      };
      return acc;
    },
    {} as Record<keyof T, FieldState>
  );

  const isValid = Object.keys(errors).every((key) => !errors[key]);
  const isDirty = Object.keys(touched).some((key) => touched[key]);

  return {
    fields,
    errors,
    touched,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    validateField,
    validateAll,
    resetForm,
    setFieldValue,
    setFieldError,
    getFieldProps,
    getSelectProps,
  };
}

export function getFieldClassName(
  errors: Record<string, string>,
  touched: Record<string, boolean>,
  field: string,
  value: string
): string {
  const hasError = errors[field] && touched[field];
  const isValid = touched[field] && !errors[field] && value;

  if (hasError) return "border-red-500 focus:ring-red-500";
  if (isValid) return "border-green-500 focus:ring-green-500";
  return "";
}
