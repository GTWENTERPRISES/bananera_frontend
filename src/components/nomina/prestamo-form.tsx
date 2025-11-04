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

export function PrestamoForm() {
  const { addPrestamo, empleados } = useApp();
  const { toast } = useToast();
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

    const empleado = empleados.find((emp) => emp.id === formData.empleadoId);
    if (!empleado) {
      toast({
        title: "Error",
        description: "Por favor selecciona un empleado válido",
        variant: "destructive",
      });
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
                  setFormData({ ...formData, empleadoId: value })
                }
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
                  setFormData({ ...formData, monto: e.target.value })
                }
                required
              />
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
                  setFormData({ ...formData, numeroCuotas: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaDesembolso">Fecha del Desembolso</Label>{" "}
              {/* Cambiado id */}
              <Input
                id="fechaDesembolso"
                type="date"
                value={formData.fechaDesembolso}
                onChange={(e) =>
                  setFormData({ ...formData, fechaDesembolso: e.target.value })
                }
                required
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="motivo">Motivo (Opcional)</Label>{" "}
              {/* Hacer opcional */}
              <Input
                id="motivo"
                value={formData.motivo}
                onChange={(e) =>
                  setFormData({ ...formData, motivo: e.target.value })
                }
                placeholder="Ej: Emergencia médica, educación, etc."
              />
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

          <Button type="submit" className="w-full gap-2">
            <DollarSign className="h-4 w-4" />
            Registrar Préstamo
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
