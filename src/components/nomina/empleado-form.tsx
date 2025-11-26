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
import type { Empleado, FincaName } from "@/src/lib/types"; // Cambia Finca por FincaName
import { UserPlus } from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";
import { EmpleadoSchema } from "@/src/lib/validation";
import { Spinner } from "@/src/components/ui/spinner";

export function EmpleadoForm() {
  const { addEmpleado, canAccess } = useApp();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    cedula: "",
    labor: "", // Cambiado de "cargo" a "labor" para coincidir con la interfaz
    finca: undefined as FincaName | undefined,
    tarifaDiaria: "", // Cambiado de "salarioDiario" a "tarifaDiaria"
    fechaIngreso: new Date().toISOString().split("T")[0],
    telefono: "",
    activo: true, // Cambiado de "estado" a "activo" (boolean)
    lote: "", // Agregado para coincidir con la interfaz
    direccion: "", // Agregado para coincidir con la interfaz
    cuentaBancaria: "", // Agregado para coincidir con la interfaz
  });

  // Función helper para validar el tipo FincaName
  const isValidFinca = (value: string): value is FincaName => {
    return ["BABY", "SOLO", "LAURITA", "MARAVILLA"].includes(value);
  };

  // Manejar cambio de finca de forma segura
  const handleFincaChange = (value: string) => {
    if (isValidFinca(value)) {
      setFormData({ ...formData, finca: value });
    } else {
      setFormData({ ...formData, finca: undefined });
    }
  };

  const allowEdit = canAccess("nomina", "edit");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!allowEdit) {
      toast({ title: "Permiso requerido", description: "Tu rol no puede registrar empleados", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    const parsed = EmpleadoSchema.safeParse({
      nombre: formData.nombre,
      cedula: formData.cedula,
      labor: formData.labor,
      finca: formData.finca || "",
      tarifaDiaria: formData.tarifaDiaria,
      fechaIngreso: formData.fechaIngreso,
      telefono: formData.telefono,
      activo: formData.activo,
      lote: formData.lote || undefined,
      direccion: formData.direccion || undefined,
      cuentaBancaria: formData.cuentaBancaria || undefined,
    });
    if (!parsed.success) {
      toast({ title: "Datos inválidos", description: parsed.error.errors[0]?.message || "Revisa los campos", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    const newEmpleado: Empleado = {
      id: Date.now().toString(),
      nombre: formData.nombre,
      cedula: formData.cedula,
      labor: formData.labor, // Cambiado de "cargo" a "labor"
      finca: formData.finca as FincaName,
      tarifaDiaria: Number.parseFloat(formData.tarifaDiaria), // Cambiado de "salarioDiario"
      fechaIngreso: formData.fechaIngreso,
      telefono: formData.telefono,
      activo: formData.activo, // Cambiado de "estado" a "activo" (boolean)
      lote: formData.lote || undefined, // Opcional
      direccion: formData.direccion || undefined, // Opcional
      cuentaBancaria: formData.cuentaBancaria || undefined, // Opcional
    };

    addEmpleado(newEmpleado);
    toast({
      title: "Empleado registrado",
      description: `${formData.nombre} ha sido agregado al sistema`,
    });

    // Reset form
    setFormData({
      nombre: "",
      cedula: "",
      labor: "",
      finca: undefined as FincaName | undefined,
      tarifaDiaria: "",
      fechaIngreso: new Date().toISOString().split("T")[0],
      telefono: "",
      activo: true,
      lote: "",
      direccion: "",
      cuentaBancaria: "",
    });
    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Empleado</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                disabled={isSubmitting || !allowEdit}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cedula">Cédula</Label>
              <Input
                id="cedula"
                value={formData.cedula}
                onChange={(e) =>
                  setFormData({ ...formData, cedula: e.target.value })
                }
                disabled={isSubmitting || !allowEdit}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="labor">Labor</Label> {/* Cambiado de "cargo" */}
              <Select
                value={formData.labor}
                onValueChange={(value) =>
                  setFormData({ ...formData, labor: value })
                }
                disabled={isSubmitting || !allowEdit}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar labor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Enfunde">Enfunde</SelectItem>
                  <SelectItem value="Cosecha">Cosecha</SelectItem>
                  <SelectItem value="Calibración">Calibración</SelectItem>
                  <SelectItem value="Varios">Varios</SelectItem>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Supervisor">Supervisor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="finca">Finca Asignada</Label>
              <Select
                value={formData.finca}
                onValueChange={handleFincaChange}
                disabled={isSubmitting || !allowEdit}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar finca" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BABY">BABY</SelectItem>
                  <SelectItem value="SOLO">SOLO</SelectItem>
                  <SelectItem value="LAURITA">LAURITA</SelectItem>
                  <SelectItem value="MARAVILLA">MARAVILLA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tarifaDiaria">Tarifa Diaria ($)</Label>{" "}
              {/* Cambiado */}
              <Input
                id="tarifaDiaria"
                type="number"
                step="0.01"
                min="0"
                value={formData.tarifaDiaria}
                onChange={(e) =>
                  setFormData({ ...formData, tarifaDiaria: e.target.value })
                }
                disabled={isSubmitting || !allowEdit}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaIngreso">Fecha de Ingreso</Label>
              <Input
                id="fechaIngreso"
                type="date"
                value={formData.fechaIngreso}
                onChange={(e) =>
                  setFormData({ ...formData, fechaIngreso: e.target.value })
                }
                disabled={isSubmitting || !allowEdit}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lote">Lote (Opcional)</Label> {/* Nuevo campo */}
              <Input
                id="lote"
                value={formData.lote}
                onChange={(e) =>
                  setFormData({ ...formData, lote: e.target.value })
                }
                disabled={isSubmitting || !allowEdit}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
                disabled={isSubmitting || !allowEdit}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección (Opcional)</Label>{" "}
              {/* Nuevo campo */}
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={(e) =>
                  setFormData({ ...formData, direccion: e.target.value })
                }
                disabled={isSubmitting || !allowEdit}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cuentaBancaria">Cuenta Bancaria (Opcional)</Label>{" "}
              {/* Nuevo campo */}
              <Input
                id="cuentaBancaria"
                value={formData.cuentaBancaria}
                onChange={(e) =>
                  setFormData({ ...formData, cuentaBancaria: e.target.value })
                }
                disabled={isSubmitting || !allowEdit}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="activo">Estado</Label> {/* Cambiado a booleano */}
              <Select
                value={formData.activo ? "activo" : "inactivo"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    activo: value === "activo",
                  })
                }
                disabled={isSubmitting || !allowEdit}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full gap-2" disabled={!allowEdit || isSubmitting}>
            {isSubmitting ? <Spinner className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            Registrar Empleado
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
