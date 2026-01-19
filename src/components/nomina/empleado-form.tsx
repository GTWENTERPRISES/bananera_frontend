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
import type { Empleado, FincaName } from "@/src/lib/types";
import { UserPlus } from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";
import { EmpleadoSchema } from "@/src/lib/validation";
import { Spinner } from "@/src/components/ui/spinner";
import { FieldFeedback, getInputClassName } from "@/src/components/ui/field-feedback";

export function EmpleadoForm() {
  const { addEmpleado, canAccess, fincas, getFilteredEmpleados } = useApp();
  const empleados = getFilteredEmpleados();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    nombre: "",
    cedula: "",
    cargo: "",
    labor: "",
    finca: undefined as string | undefined,
    salarioBase: "",
    tarifaDiaria: "",
    fechaIngreso: new Date().toISOString().split("T")[0],
    telefono: "",
    activo: true,
    lote: "",
    direccion: "",
    cuentaBancaria: "",
  });

  // Función helper para validar UUID de finca
  const isValidFinca = (value: string): boolean => {
    return fincas.some(f => f.id === value);
  };
  
  // Helper para obtener el nombre de la finca por UUID
  const getFincaNombre = (fincaId: string): string => {
    return fincas.find(f => f.id === fincaId)?.nombre || fincaId;
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

  const validateField = (field: string, value: any): string => {
    try {
      const dataToValidate = {
        nombre: formData.nombre,
        cedula: formData.cedula,
        labor: formData.labor,
        finca: formData.finca || "",
        tarifaDiaria: formData.tarifaDiaria,
        fechaIngreso: formData.fechaIngreso,
        telefono: formData.telefono,
        activo: formData.activo,
        lote: formData.lote || undefined,
        direccion: formData.direccion,
        cuentaBancaria: formData.cuentaBancaria,
        [field]: value,
      };
      const parsed = EmpleadoSchema.safeParse(dataToValidate);
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
      direccion: formData.direccion,
      cuentaBancaria: formData.cuentaBancaria,
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

    // Verificar duplicado por cédula
    const cedulaExiste = empleados.some((e) => e.cedula === formData.cedula);
    if (cedulaExiste) {
      toast({ title: "Cédula duplicada", description: "Ya existe un empleado con esta cédula", variant: "destructive" });
      setErrors(prev => ({ ...prev, cedula: "Esta cédula ya está registrada" }));
      setIsSubmitting(false);
      return;
    }

    const newEmpleado: Empleado = {
      id: Date.now().toString(),
      nombre: formData.nombre,
      cedula: formData.cedula,
      cargo: formData.cargo || formData.labor,
      labor: formData.labor || undefined,
      finca: formData.finca as string,
      salarioBase: Number.parseFloat(formData.salarioBase) || 0,
      tarifaDiaria: Number.parseFloat(formData.tarifaDiaria) || undefined,
      fechaIngreso: formData.fechaIngreso,
      telefono: formData.telefono || undefined,
      activo: formData.activo,
      lote: formData.lote || undefined,
      direccion: formData.direccion || undefined,
      cuentaBancaria: formData.cuentaBancaria || undefined,
    };

    addEmpleado(newEmpleado)
      .then(() => {
        toast({
          title: "Empleado registrado",
          description: `${formData.nombre} ha sido agregado al sistema`,
        });
        // Reset form
        setFormData({
          nombre: "",
          cedula: "",
          cargo: "",
          labor: "",
          finca: undefined,
          salarioBase: "",
          tarifaDiaria: "",
          fechaIngreso: new Date().toISOString().split("T")[0],
          telefono: "",
          activo: true,
          lote: "",
          direccion: "",
          cuentaBancaria: "",
        });
        setErrors({});
      })
      .catch((error: Error) => {
        console.error("Error al guardar empleado:", error);
        toast({
          title: "Error al guardar",
          description: error?.message || "No se pudo crear el empleado",
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
        <CardTitle>Registrar Empleado</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo *</Label>
              <p className="text-xs text-muted-foreground">Nombres y apellidos del trabajador</p>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleFieldChange("nombre", e.target.value)}
                onBlur={(e) => handleFieldBlur("nombre", e.target.value)}
                disabled={isSubmitting || !allowEdit}
                required
                className={getInputClassName(errors, touched, "nombre", formData.nombre)}
              />
              <FieldFeedback
                error={errors.nombre}
                touched={touched.nombre}
                isValid={!errors.nombre && !!formData.nombre}
                successMessage="Nombre válido"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cedula">Cédula *</Label>
              <p className="text-xs text-muted-foreground">10 dígitos, cédula ecuatoriana</p>
              <Input
                id="cedula"
                value={formData.cedula}
                onChange={(e) => handleFieldChange("cedula", e.target.value)}
                onBlur={(e) => handleFieldBlur("cedula", e.target.value)}
                disabled={isSubmitting || !allowEdit}
                required
                placeholder="0123456789"
                className={getInputClassName(errors, touched, "cedula", formData.cedula)}
              />
              <FieldFeedback
                error={errors.cedula}
                touched={touched.cedula}
                isValid={!errors.cedula && !!formData.cedula}
                successMessage="Cédula válida"
                infoMessage={!touched.cedula ? "10 dígitos, cédula ecuatoriana" : undefined}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="labor">Labor *</Label>
              <p className="text-xs text-muted-foreground">Actividad principal del empleado</p>
              <Select
                value={formData.labor}
                onValueChange={(value) =>
                  (setFormData({ ...formData, labor: value, cargo: value }), setErrors((prev) => ({ ...prev, labor: "" })))
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
                  <SelectItem value="Fumigación">Fumigación</SelectItem>
                  <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                </SelectContent>
              </Select>
              {errors.labor && (
                <p className="text-xs text-red-600">{errors.labor}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="finca">Finca Asignada *</Label>
              <p className="text-xs text-muted-foreground">Finca donde trabaja el empleado</p>
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
                  {fincas.map((finca) => (
                    <SelectItem key={finca.id} value={finca.nombre}>
                      {finca.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.finca && (
                <p className="text-xs text-red-600">{errors.finca}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tarifaDiaria">Tarifa Diaria ($) *</Label>
              <p className="text-xs text-muted-foreground">Salario por día de trabajo</p>
              <Input
                id="tarifaDiaria"
                type="number"
                step="0.01"
                min="0"
                value={formData.tarifaDiaria}
                onChange={(e) => handleFieldChange("tarifaDiaria", e.target.value)}
                onBlur={(e) => handleFieldBlur("tarifaDiaria", e.target.value)}
                disabled={isSubmitting || !allowEdit}
                required
                className={getInputClassName(errors, touched, "tarifaDiaria", formData.tarifaDiaria)}
              />
              <FieldFeedback
                error={errors.tarifaDiaria}
                touched={touched.tarifaDiaria}
                isValid={!errors.tarifaDiaria && !!formData.tarifaDiaria}
                successMessage="Tarifa válida"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaIngreso">Fecha de Ingreso *</Label>
              <p className="text-xs text-muted-foreground">Día que comenzó a trabajar</p>
              <Input
                id="fechaIngreso"
                type="date"
                value={formData.fechaIngreso}
                onChange={(e) =>
                  (setFormData({ ...formData, fechaIngreso: e.target.value }), setErrors((prev) => ({ ...prev, fechaIngreso: "" })))
                }
                disabled={isSubmitting || !allowEdit}
                required
              />
              {errors.fechaIngreso && (
                <p className="text-xs text-red-600">{errors.fechaIngreso}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lote">Lote (Opcional)</Label>
              <p className="text-xs text-muted-foreground">Sector de trabajo en la finca</p>
              <Select
                value={formData.lote}
                onValueChange={(value) => setFormData({ ...formData, lote: value })}
                disabled={isSubmitting || !allowEdit || !formData.finca}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar lote" />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    const f = fincas.find((x) => x.nombre === formData.finca);
                    const keys = f?.lotes ? Object.keys(f.lotes) : ["A","B","C","D","E"];
                    return keys.map((k) => (
                      <SelectItem key={k} value={k}>{k}</SelectItem>
                    ));
                  })()}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => handleFieldChange("telefono", e.target.value)}
                onBlur={(e) => handleFieldBlur("telefono", e.target.value)}
                disabled={isSubmitting || !allowEdit}
                placeholder="0999999999"
                className={getInputClassName(errors, touched, "telefono", formData.telefono)}
              />
              <FieldFeedback
                error={errors.telefono}
                touched={touched.telefono}
                isValid={!errors.telefono && !!formData.telefono}
                successMessage="Teléfono válido"
                infoMessage={!touched.telefono ? "Formato: 09XXXXXXXX" : undefined}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={(e) => handleFieldChange("direccion", e.target.value)}
                onBlur={(e) => handleFieldBlur("direccion", e.target.value)}
                disabled={isSubmitting || !allowEdit}
                required
                className={getInputClassName(errors, touched, "direccion", formData.direccion)}
              />
              <FieldFeedback
                error={errors.direccion}
                touched={touched.direccion}
                isValid={!errors.direccion && !!formData.direccion}
                successMessage="Dirección válida"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cuentaBancaria">Cuenta Bancaria</Label>
              <Input
                id="cuentaBancaria"
                value={formData.cuentaBancaria}
                onChange={(e) => handleFieldChange("cuentaBancaria", e.target.value)}
                onBlur={(e) => handleFieldBlur("cuentaBancaria", e.target.value)}
                disabled={isSubmitting || !allowEdit}
                required
                className={getInputClassName(errors, touched, "cuentaBancaria", formData.cuentaBancaria)}
              />
              <FieldFeedback
                error={errors.cuentaBancaria}
                touched={touched.cuentaBancaria}
                isValid={!errors.cuentaBancaria && !!formData.cuentaBancaria}
                successMessage="Cuenta bancaria válida"
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
