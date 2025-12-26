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
import type { Insumo, FincaName } from "@/src/lib/types";
import { Package } from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";
import { InsumoSchema } from "@/src/lib/validation";
import { Spinner } from "@/src/components/ui/spinner";

export function InsumoForm() {
  const { addInsumo, canAccess, fincas } = useApp();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "" as
      | "fertilizante"
      | "protector"
      | "herramienta"
      | "empaque"
      | "otro", // Tipado específico
    unidadMedida: "",
    stockActual: "",
    stockMinimo: "",
    stockMaximo: "", // Agregado para coincidir con la interfaz
    precioUnitario: "",
    proveedor: "",
    finca: "" as FincaName | "",
  });

  // Función helper para validar el tipo de categoría
  const isValidCategoria = (
    value: string
  ): value is
    | "fertilizante"
    | "protector"
    | "herramienta"
    | "empaque"
    | "otro" => {
    return [
      "fertilizante",
      "protector",
      "herramienta",
      "empaque",
      "otro",
    ].includes(value);
  };

  // Manejar cambio de categoría de forma segura
  const handleCategoriaChange = (value: string) => {
    if (isValidCategoria(value)) {
      setFormData({ ...formData, categoria: value });
    } else {
      setFormData({
        ...formData,
        categoria: "" as
          | "fertilizante"
          | "protector"
          | "herramienta"
          | "empaque"
          | "otro",
      });
    }
  };

  const allowEdit = canAccess("inventario", "edit");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!allowEdit) {
      toast({ title: "Permiso requerido", description: "Tu rol no puede registrar insumos", variant: "destructive" });
      return;
    }

    const parsed = InsumoSchema.safeParse({
      nombre: formData.nombre,
      categoria: formData.categoria || "",
      unidadMedida: formData.unidadMedida,
      stockActual: formData.stockActual,
      stockMinimo: formData.stockMinimo,
      stockMaximo: formData.stockMaximo,
      precioUnitario: formData.precioUnitario,
      proveedor: formData.proveedor,
      finca: formData.finca || undefined,
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

    const newInsumo: Insumo = {
      id: Date.now().toString(),
      nombre: formData.nombre,
      categoria: formData.categoria, // Ya está tipado correctamente
      unidadMedida: formData.unidadMedida,
      stockActual: Number.parseFloat(formData.stockActual),
      stockMinimo: Number.parseFloat(formData.stockMinimo),
      stockMaximo: Number.parseFloat(formData.stockMaximo), // Agregado
      precioUnitario: Number.parseFloat(formData.precioUnitario),
      proveedor: formData.proveedor,
      // fechaVencimiento es opcional, no se incluye aquí
      finca: formData.finca || undefined,
    };

    addInsumo(newInsumo);

    if (newInsumo.stockActual < newInsumo.stockMinimo) {
      toast({
        title: "Alerta: Stock Bajo",
        description: `${formData.nombre} está por debajo del stock mínimo`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Insumo registrado",
        description: `${formData.nombre} agregado al inventario`,
      });
    }

    // Reset form
    setFormData({
      nombre: "",
      categoria: "" as
        | "fertilizante"
        | "protector"
        | "herramienta"
        | "empaque"
        | "otro",
      unidadMedida: "",
      stockActual: "",
      stockMinimo: "",
      stockMaximo: "",
      precioUnitario: "",
      proveedor: "",
      finca: "" as FincaName | "",
    });
    setErrors({});
    setIsSubmitting(false);
  };

  return (
    <Card className="responsive-card w-full sm:max-w-[700px] mx-auto">
      <CardHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <CardTitle className="text-base sm:text-lg md:text-xl">Registrar Insumo</CardTitle>
      </CardHeader>
      <CardContent className="responsive-form px-4 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3 md:space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-3 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="font-medium">Nombre del Insumo</Label>
                <Input
                  id="nombre"
                  className="h-11 w-full"
                  value={formData.nombre}
                  onChange={(e) =>
                    (setFormData({ ...formData, nombre: e.target.value }), setErrors((prev) => ({ ...prev, nombre: "" })))
                  }
                  disabled={isSubmitting || !allowEdit}
                  required
                />
                {errors.nombre && (
                  <p className="text-xs text-red-600">{errors.nombre}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria" className="font-medium">Categoría</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={handleCategoriaChange}
                  disabled={isSubmitting || !allowEdit}
                  required
                >
                  <SelectTrigger className="h-11 w-full max-w-[280px] xl:max-w-none">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent side="bottom" align="start" position="popper" className="w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-24px)] sm:max-w-[95vw] max-h-[60vh] sm:max-h-[70vh]">
                    <SelectItem value="fertilizante">Fertilizante</SelectItem>
                    <SelectItem value="protector">Protector</SelectItem>
                    <SelectItem value="herramienta">Herramienta</SelectItem>
                    <SelectItem value="empaque">Empaque</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
                {errors.categoria && (
                  <p className="text-xs text-red-600">{errors.categoria}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-3 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor="unidadMedida" className="font-medium">Unidad de Medida</Label>
                <Input
                  id="unidadMedida"
                  className="h-11 w-full"
                  value={formData.unidadMedida}
                  onChange={(e) =>
                    (setFormData({ ...formData, unidadMedida: e.target.value }), setErrors((prev) => ({ ...prev, unidadMedida: "" })))
                  }
                  placeholder="Ej: kg, L, unidades, rollos, etc."
                  disabled={isSubmitting || !allowEdit}
                  required
                />
                {errors.unidadMedida && (
                  <p className="text-xs text-red-600">{errors.unidadMedida}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stockActual" className="font-medium">Stock Actual</Label>
                <Input
                  id="stockActual"
                  type="number"
                  step="0.01"
                  min="0"
                  className="h-11 w-[160px] sm:w-[180px] xl:w-full"
                  value={formData.stockActual}
                  onChange={(e) =>
                    (setFormData({ ...formData, stockActual: e.target.value }), setErrors((prev) => ({ ...prev, stockActual: "" })))
                  }
                  disabled={isSubmitting || !allowEdit}
                  required
                />
                {errors.stockActual && (
                  <p className="text-xs text-red-600">{errors.stockActual}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockMinimo" className="font-medium">Stock Mínimo</Label>
              <Input
                id="stockMinimo"
                type="number"
                step="0.01"
                min="0"
                className="h-11 w-[160px] sm:w-[180px] xl:w-full"
                value={formData.stockMinimo}
                onChange={(e) =>
                  (setFormData({ ...formData, stockMinimo: e.target.value }), setErrors((prev) => ({ ...prev, stockMinimo: "" })))
                }
                disabled={isSubmitting || !allowEdit}
                required
              />
              {errors.stockMinimo && (
                <p className="text-xs text-red-600">{errors.stockMinimo}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockMaximo" className="font-medium">Stock Máximo</Label>
              {/* Nuevo campo */}
              <Input
                id="stockMaximo"
                type="number"
                step="0.01"
                min="0"
                className="h-11 w-[160px] sm:w-[180px] xl:w-full"
                value={formData.stockMaximo}
                onChange={(e) =>
                  (setFormData({ ...formData, stockMaximo: e.target.value }), setErrors((prev) => ({ ...prev, stockMaximo: "" })))
                }
                disabled={isSubmitting || !allowEdit}
                required
              />
              {errors.stockMaximo && (
                <p className="text-xs text-red-600">{errors.stockMaximo}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="precioUnitario" className="font-medium">Precio Unitario ($)</Label>
              <Input
                id="precioUnitario"
                type="number"
                step="0.01"
                min="0"
                className="h-11 w-[160px] sm:w-[180px] xl:w-full"
                value={formData.precioUnitario}
                onChange={(e) =>
                  (setFormData({ ...formData, precioUnitario: e.target.value }), setErrors((prev) => ({ ...prev, precioUnitario: "" })))
                }
                disabled={isSubmitting || !allowEdit}
                required
              />
              {errors.precioUnitario && (
                <p className="text-xs text-red-600">{errors.precioUnitario}</p>
              )}
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="proveedor" className="font-medium">Proveedor</Label>
              <Input
                id="proveedor"
                className="h-11"
                value={formData.proveedor}
                onChange={(e) =>
                  (setFormData({ ...formData, proveedor: e.target.value }), setErrors((prev) => ({ ...prev, proveedor: "" })))
                }
                disabled={isSubmitting || !allowEdit}
                required
              />
              {errors.proveedor && (
                <p className="text-xs text-red-600">{errors.proveedor}</p>
              )}
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="finca" className="font-medium">Finca Asociada</Label>
              <Select
                value={formData.finca}
                onValueChange={(value) =>
                  (setFormData({ ...formData, finca: value as FincaName }), setErrors((prev) => ({ ...prev, finca: "" })))
                }
                disabled={isSubmitting || !allowEdit}
              >
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="Seleccionar finca (opcional)" />
                </SelectTrigger>
                <SelectContent side="bottom" align="start" position="popper" className="w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-24px)] sm:max-w-[95vw] max-h-[60vh] sm:max-h-[70vh]">
                  {fincas.map((f) => (
                    <SelectItem key={f.id} value={f.nombre as FincaName}>
                      {f.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.finca && (
                <p className="text-xs text-red-600">{errors.finca}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full gap-2 h-11 text-base" disabled={!allowEdit || isSubmitting}>
            {isSubmitting ? <Spinner className="h-4 w-4" /> : <Package className="h-4 w-4" />}
            Registrar Insumo
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
