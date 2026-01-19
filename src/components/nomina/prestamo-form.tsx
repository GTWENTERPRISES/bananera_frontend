"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { useApp } from "@/src/contexts/app-context";
import type { Prestamo, Empleado } from "@/src/lib/types";
import { DollarSign } from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";
import { PrestamoSchema } from "@/src/lib/validation";
import { Spinner } from "@/src/components/ui/spinner";
import { FieldFeedback, getInputClassName } from "@/src/components/ui/field-feedback";

export function PrestamoForm() {
  const { addPrestamo, getFilteredEmpleados } = useApp();
  const empleados = getFilteredEmpleados();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    empleadoId: "",
    monto: "",
    numeroCuotas: "", // Cambiado de "cuotas" a "numeroCuotas"
    fechaDesembolso: new Date().toISOString().split("T")[0], // Cambiado de "fechaPrestamo"
    motivo: "",
  });

  const valorCuota =
    Number.parseFloat(formData.monto || "0") /
    Number.parseInt(formData.numeroCuotas || "1");

  const validateField = (field: string, value: any): string => {
    try {
      const dataToValidate = {
        empleadoId: formData.empleadoId,
        monto: formData.monto,
        numeroCuotas: formData.numeroCuotas,
        fechaDesembolso: formData.fechaDesembolso,
        motivo: formData.motivo || undefined,
        [field]: value,
      };
      const parsed = PrestamoSchema.safeParse(dataToValidate);
      if (!parsed.success) {
        const flat = parsed.error.flatten().fieldErrors;
        const fieldError = flat[field as keyof typeof flat];
        if (fieldError && fieldError.length > 0) {
          return String(fieldError[0]);
        }
      }
      return "";
    } catch {
      return "";
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field] || value !== "") {
      const err = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: err }));
    }
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleFieldBlur = (field: string, value: any) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const err = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: err }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const parsed = PrestamoSchema.safeParse({
      empleadoId: formData.empleadoId,
      monto: formData.monto,
      numeroCuotas: formData.numeroCuotas,
      fechaDesembolso: formData.fechaDesembolso,
      motivo: formData.motivo || undefined,
    });
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      const fieldErrors: Record<string, string> = {};
      Object.entries(flat.fieldErrors).forEach(([k, v]) => {
        if (v && v.length) fieldErrors[k] = String(v[0]);
      });
      setErrors(fieldErrors);
      toast({ title: "Datos inválidos", description: Object.values(fieldErrors)[0] || "Revisa los campos", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    const empleado = empleados.find((emp) => emp.id === formData.empleadoId);
    if (!empleado) {
      toast({
        title: "Error",
        description: "Por favor selecciona un empleado válido",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const newPrestamo: Prestamo = {
      id: Date.now().toString(),
      empleadoId: formData.empleadoId,
      empleado: empleado, // Usar el objeto empleado completo en lugar de empleadoNombre
      monto: Number.parseFloat(formData.monto),
      fechaDesembolso: formData.fechaDesembolso, // Cambiado de fechaPrestamo
      numeroCuotas: Number.parseInt(formData.numeroCuotas), // Cambiado de cuotas
      valorCuota: Number.parseFloat(valorCuota.toFixed(2)), // Cambiado de montoCuota
      cuotasPagadas: 0,
      saldoPendiente: Number.parseFloat(formData.monto),
      estado: "activo",
    };

    addPrestamo(newPrestamo)
      .then(() => {
        toast({
          title: "Préstamo registrado",
          description: `$${formData.monto} para ${empleado.nombre} en ${formData.numeroCuotas} cuotas`,
        });
        // Reset form
        setFormData({
          empleadoId: "",
          monto: "",
          numeroCuotas: "",
          fechaDesembolso: new Date().toISOString().split("T")[0],
          motivo: "",
        });
        setErrors({});
      })
      .catch((error: Error) => {
        console.error("Error al guardar préstamo:", error);
        toast({
          title: "Error al guardar",
          description: error?.message || "No se pudo crear el préstamo",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Préstamo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="empleado">Empleado *</Label>
              <p className="text-xs text-muted-foreground">Trabajador que recibirá el préstamo</p>
              <Select
                value={formData.empleadoId}
                onValueChange={(value) =>
                  (setFormData({ ...formData, empleadoId: value }), setErrors((prev) => ({ ...prev, empleadoId: "" })))
                }
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar empleado" />
                </SelectTrigger>
                <SelectContent>
                  {empleados
                    .filter((e) => e.activo) // Cambiado de estado a activo (boolean)
                    .map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.nombre} - {emp.labor}{" "}
                        {/* Cambiado de cargo a labor */}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.empleadoId && (
                <p className="text-xs text-red-600">{errors.empleadoId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="monto">Monto del Préstamo ($) *</Label>
              <p className="text-xs text-muted-foreground">Valor total a prestar</p>
              <Input
                id="monto"
                type="number"
                step="0.01"
                min="0"
                value={formData.monto}
                onChange={(e) => handleFieldChange("monto", e.target.value)}
                onBlur={(e) => handleFieldBlur("monto", e.target.value)}
                disabled={isSubmitting}
                required
                className={getInputClassName(errors, touched, "monto", formData.monto)}
              />
              <FieldFeedback
                error={errors.monto}
                touched={touched.monto}
                isValid={!errors.monto && !!formData.monto}
                successMessage="Monto válido"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numeroCuotas">Número de Cuotas *</Label>
              <p className="text-xs text-muted-foreground">Cuotas para pagar el préstamo</p>
              <Input
                id="numeroCuotas"
                type="number"
                min="1"
                value={formData.numeroCuotas}
                onChange={(e) => handleFieldChange("numeroCuotas", e.target.value)}
                onBlur={(e) => handleFieldBlur("numeroCuotas", e.target.value)}
                disabled={isSubmitting}
                required
                className={getInputClassName(errors, touched, "numeroCuotas", formData.numeroCuotas)}
              />
              <FieldFeedback
                error={errors.numeroCuotas}
                touched={touched.numeroCuotas}
                isValid={!errors.numeroCuotas && !!formData.numeroCuotas}
                successMessage="Número de cuotas válido"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaDesembolso">Fecha del Desembolso *</Label>
              <p className="text-xs text-muted-foreground">Día que se entregó el dinero</p>
              <Input
                id="fechaDesembolso"
                type="date"
                value={formData.fechaDesembolso}
                onChange={(e) =>
                  (setFormData({ ...formData, fechaDesembolso: e.target.value }), setErrors((prev) => ({ ...prev, fechaDesembolso: "" })))
                }
                disabled={isSubmitting}
                required
              />
              {errors.fechaDesembolso && (
                <p className="text-xs text-red-600">{errors.fechaDesembolso}</p>
              )}
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="motivo">Motivo (Opcional)</Label>{" "}
              {/* Hacer opcional */}
              <Input
                id="motivo"
                value={formData.motivo}
                onChange={(e) =>
                  (setFormData({ ...formData, motivo: e.target.value }), setErrors((prev) => ({ ...prev, motivo: "" })))
                }
                placeholder="Ej: Emergencia médica, educación, etc."
                disabled={isSubmitting}
              />
              {errors.motivo && (
                <p className="text-xs text-red-600">{errors.motivo}</p>
              )}
            </div>
          </div>

          {formData.monto && formData.numeroCuotas && (
            <div className="rounded-lg border border-primary bg-primary/10 p-4">
              <div className="mb-2 text-sm font-medium text-primary">
                Detalle del Préstamo
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Valor por Cuota
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    ${valorCuota.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total a Pagar</p>
                  <p className="text-lg font-bold text-foreground">
                    ${formData.monto}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
            {isSubmitting ? <Spinner className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
            Registrar Préstamo
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
