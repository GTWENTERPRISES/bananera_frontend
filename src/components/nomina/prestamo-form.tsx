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

export function PrestamoForm() {
  const { addPrestamo, empleados } = useApp();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
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

    addPrestamo(newPrestamo);
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
    setIsSubmitting(false);
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
              <Label htmlFor="empleado">Empleado</Label>
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
              <Label htmlFor="monto">Monto del Préstamo ($)</Label>
              <Input
                id="monto"
                type="number"
                step="0.01"
                min="0"
                value={formData.monto}
                onChange={(e) =>
                  (setFormData({ ...formData, monto: e.target.value }), setErrors((prev) => ({ ...prev, monto: "" })))
                }
                disabled={isSubmitting}
                required
              />
              {errors.monto && (
                <p className="text-xs text-red-600">{errors.monto}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="numeroCuotas">Número de Cuotas</Label>{" "}
              {/* Cambiado id */}
              <Input
                id="numeroCuotas"
                type="number"
                min="1"
                value={formData.numeroCuotas}
                onChange={(e) =>
                  (setFormData({ ...formData, numeroCuotas: e.target.value }), setErrors((prev) => ({ ...prev, numeroCuotas: "" })))
                }
                disabled={isSubmitting}
                required
              />
              {errors.numeroCuotas && (
                <p className="text-xs text-red-600">{errors.numeroCuotas}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaDesembolso">Fecha del Desembolso</Label>{" "}
              {/* Cambiado id */}
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
