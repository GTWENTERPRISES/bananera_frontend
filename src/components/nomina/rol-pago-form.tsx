"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/src//components/ui/button";
import { Input } from "@/src//components/ui/input";
import { Label } from "@/src//components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src//components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/src//components/ui/card";
import { useApp } from "@/src//contexts/app-context";
import type { RolPago } from "@/src//lib/types";
import { Calculator, DollarSign } from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";
import { RolPagoInputSchema } from "@/src/lib/validation";
import { Spinner } from "@/src/components/ui/spinner";

export function RolPagoForm() {
  const { addRolPago, getFilteredEmpleados, getFilteredPrestamos, updatePrestamo } = useApp();
  const empleados = getFilteredEmpleados();
  const prestamos = getFilteredPrestamos();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    empleadoId: "",
    semana: "",
    año: "2025",
    diasLaborados: "",
    horasExtras: "",
    cosecha: "",
    tareasEspeciales: "",
    multas: "",
    prestamos: "",
  });

  const empleado = empleados.find((e) => e.id === formData.empleadoId);
  const tarifaDiaria = empleado?.tarifaDiaria || 0;
  const diasLaborados = Number.parseInt(formData.diasLaborados || "0");
  const horasExtras = Number.parseFloat(formData.horasExtras || "0");

  const sueldoBase = tarifaDiaria * diasLaborados;
  const pagoHorasExtras = horasExtras * (tarifaDiaria / 8) * 1.5;
  const cosecha = Number.parseFloat(formData.cosecha || "0");
  const tareasEspeciales = Number.parseFloat(formData.tareasEspeciales || "0");
  const totalIngresos =
    sueldoBase + pagoHorasExtras + cosecha + tareasEspeciales;

  const iess = totalIngresos * 0.0512; // 5.12% IESS
  const multas = Number.parseFloat(formData.multas || "0");
  const descuentoPrestamos = Number.parseFloat(formData.prestamos || "0");
  const totalEgresos = iess + multas + descuentoPrestamos;

  const netoAPagar = totalIngresos - totalEgresos;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const parsed = RolPagoInputSchema.safeParse({
      empleadoId: formData.empleadoId,
      semana: formData.semana,
      año: formData.año,
      diasLaborados: formData.diasLaborados,
      horasExtras: formData.horasExtras || undefined,
      cosecha: formData.cosecha || undefined,
      tareasEspeciales: formData.tareasEspeciales || undefined,
      multas: formData.multas || undefined,
      prestamos: formData.prestamos || undefined,
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

    if (!empleado) {
      toast({
        title: "Error",
        description: "Debe seleccionar un empleado",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const newRolPago: RolPago = {
      id: Date.now().toString(),
      empleadoId: formData.empleadoId,
      empleado: empleado,
      finca: empleado.finca,
      semana: Number.parseInt(formData.semana),
      año: Number.parseInt(formData.año),
      fecha: new Date().toISOString().split("T")[0],
      diasLaborados: diasLaborados,
      horasExtras: Number.parseFloat(horasExtras.toFixed(2)),
      sueldoBase: Number.parseFloat(sueldoBase.toFixed(2)),
      cosecha: Number.parseFloat(cosecha.toFixed(2)),
      tareasEspeciales: Number.parseFloat(tareasEspeciales.toFixed(2)),
      totalIngresos: Number.parseFloat(totalIngresos.toFixed(2)),
      iess: Number.parseFloat(iess.toFixed(2)),
      multas: Number.parseFloat(multas.toFixed(2)),
      prestamos: Number.parseFloat(descuentoPrestamos.toFixed(2)),
      totalEgresos: Number.parseFloat(totalEgresos.toFixed(2)),
      netoAPagar: Number.parseFloat(netoAPagar.toFixed(2)),
      estado: "pendiente",
      prestamoAplicado: false,
    };

    addRolPago(newRolPago);
    toast({
      title: "Rol de pago generado",
      description: `Neto a pagar: $${netoAPagar.toFixed(2)} para ${
        empleado.nombre
      }`,
    });

    // Reset form
    setFormData({
      empleadoId: "",
      semana: "",
      año: "2025",
      diasLaborados: "",
      horasExtras: "",
      cosecha: "",
      tareasEspeciales: "",
      multas: "",
      prestamos: "",
    });
    setErrors({});
    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generar Rol de Pago</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="empleado">Empleado *</Label>
              <p className="text-xs text-muted-foreground">Trabajador a generar rol</p>
              <Select
                value={formData.empleadoId}
                onValueChange={(value) => {
                  const p = prestamos.find((x) => x.empleadoId === value && x.estado === "activo");
                  const cuota = p ? String(Number(p.valorCuota.toFixed(2))) : "";
                  setFormData({ ...formData, empleadoId: value, prestamos: cuota });
                  setErrors((prev) => ({ ...prev, empleadoId: "" }));
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar empleado" />
                </SelectTrigger>
                <SelectContent>
                  {empleados.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.nombre} - {emp.labor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.empleadoId && (
                <p className="text-xs text-red-600">{errors.empleadoId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="semana">Semana *</Label>
              <p className="text-xs text-muted-foreground">Semana del año (1-53)</p>
              <Input
                id="semana"
                type="number"
                min="1"
                max="52"
                value={formData.semana}
                onChange={(e) =>
                  (setFormData({ ...formData, semana: e.target.value }), setErrors((prev) => ({ ...prev, semana: "" })))
                }
                disabled={isSubmitting}
                required
              />
              {errors.semana && (
                <p className="text-xs text-red-600">{errors.semana}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="diasLaborados">Días Laborados *</Label>
              <p className="text-xs text-muted-foreground">Días trabajados (0-7)</p>
              <Input
                id="diasLaborados"
                type="number"
                min="0"
                max="7"
                value={formData.diasLaborados}
                onChange={(e) =>
                  (setFormData({ ...formData, diasLaborados: e.target.value }), setErrors((prev) => ({ ...prev, diasLaborados: "" })))
                }
                disabled={isSubmitting}
                required
              />
              {errors.diasLaborados && (
                <p className="text-xs text-red-600">{errors.diasLaborados}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="horasExtras">Horas Extras</Label>
              <p className="text-xs text-muted-foreground">Horas adicionales trabajadas</p>
              <Input
                id="horasExtras"
                type="number"
                step="0.5"
                min="0"
                value={formData.horasExtras}
                onChange={(e) =>
                  (setFormData({ ...formData, horasExtras: e.target.value }), setErrors((prev) => ({ ...prev, horasExtras: "" })))
                }
                disabled={isSubmitting}
              />
              {errors.horasExtras && (
                <p className="text-xs text-red-600">{errors.horasExtras}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cosecha">Cosecha ($)</Label>
              <p className="text-xs text-muted-foreground">Pago adicional por cosecha</p>
              <Input
                id="cosecha"
                type="number"
                step="0.01"
                min="0"
                value={formData.cosecha}
                onChange={(e) =>
                  (setFormData({ ...formData, cosecha: e.target.value }), setErrors((prev) => ({ ...prev, cosecha: "" })))
                }
                disabled={isSubmitting}
              />
              {errors.cosecha && (
                <p className="text-xs text-red-600">{errors.cosecha}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tareasEspeciales">Tareas Especiales ($)</Label>
              <p className="text-xs text-muted-foreground">Bonos por trabajos especiales</p>
              <Input
                id="tareasEspeciales"
                type="number"
                step="0.01"
                min="0"
                value={formData.tareasEspeciales}
                onChange={(e) =>
                  (setFormData({ ...formData, tareasEspeciales: e.target.value }), setErrors((prev) => ({ ...prev, tareasEspeciales: "" })))
                }
                disabled={isSubmitting}
              />
              {errors.tareasEspeciales && (
                <p className="text-xs text-red-600">{errors.tareasEspeciales}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="multas">Multas ($)</Label>
              <p className="text-xs text-muted-foreground">Descuentos por faltas</p>
              <Input
                id="multas"
                type="number"
                step="0.01"
                min="0"
                value={formData.multas}
                onChange={(e) =>
                  (setFormData({ ...formData, multas: e.target.value }), setErrors((prev) => ({ ...prev, multas: "" })))
                }
                disabled={isSubmitting}
              />
              {errors.multas && (
                <p className="text-xs text-red-600">{errors.multas}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="prestamos">Descuento Préstamos ($)</Label>
              <p className="text-xs text-muted-foreground">Cuota de préstamo activo</p>
              <Input
                id="prestamos"
                type="number"
                step="0.01"
                min="0"
                value={formData.prestamos}
                onChange={(e) =>
                  (setFormData({ ...formData, prestamos: e.target.value }), setErrors((prev) => ({ ...prev, prestamos: "" })))
                }
                disabled={isSubmitting}
              />
              {errors.prestamos && (
                <p className="text-xs text-red-600">{errors.prestamos}</p>
              )}
            </div>
          </div>

          {empleado && (
            <div className="rounded-lg border border-primary bg-primary/10 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
                <Calculator className="h-4 w-4" />
                Cálculo de Nómina
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Tarifa Diaria</p>
                  <p className="text-sm font-medium text-foreground">
                    ${tarifaDiaria.toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Sueldo Base</p>
                  <p className="text-sm font-medium text-foreground">
                    ${sueldoBase.toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Pago Horas Extras
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    ${pagoHorasExtras.toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Total Ingresos
                  </p>
                  <p className="text-sm font-medium text-green-600">
                    ${totalIngresos.toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">IESS (5.12%)</p>
                  <p className="text-sm font-medium text-red-600">
                    ${iess.toFixed(2)}
                  </p>
                </div>
                {(() => {
                  const p = prestamos.find((x) => x.empleadoId === formData.empleadoId && x.estado === "activo");
                  if (!p) return null;
                  return (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Préstamo activo</p>
                      <p className="text-sm font-medium text-foreground">Saldo ${p.saldoPendiente.toFixed(2)} · Cuota ${p.valorCuota.toFixed(2)}</p>
                    </div>
                  );
                })()}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Total Egresos</p>
                  <p className="text-sm font-medium text-red-600">
                    ${totalEgresos.toFixed(2)}
                  </p>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-xs text-muted-foreground">Neto a Pagar</p>
                  <p className="text-lg font-bold text-foreground">
                    ${netoAPagar.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full gap-2" disabled={!empleado || isSubmitting}>
            {isSubmitting ? <Spinner className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
            Generar Rol de Pago
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
