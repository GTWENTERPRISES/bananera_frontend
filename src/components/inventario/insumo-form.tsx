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
import { FieldFeedback, getInputClassName } from "@/src/components/ui/field-feedback";

export function InsumoForm() {
  const { addInsumo, canAccess, fincas, getFilteredInsumos } = useApp();
  const insumos = getFilteredInsumos();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
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
      setErrors(prev => ({ ...prev, categoria: "" }));
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
    setTouched(prev => ({ ...prev, categoria: true }));
  };

  const validateField = (field: string, value: string): string => {
    try {
      const dataToValidate = {
        nombre: formData.nombre,
        categoria: formData.categoria || "",
        unidadMedida: formData.unidadMedida,
        stockActual: formData.stockActual,
        stockMinimo: formData.stockMinimo,
        stockMaximo: formData.stockMaximo,
        precioUnitario: formData.precioUnitario,
        proveedor: formData.proveedor,
        finca: formData.finca || undefined,
        [field]: value,
      };
      const parsed = InsumoSchema.safeParse(dataToValidate);
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

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field] || value !== "") {
      const err = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: err }));
    }
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleFieldBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const err = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: err }));
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

    // Verificar duplicado por nombre + finca
    const insumoExiste = insumos.some(
      (i) => i.nombre.toLowerCase() === formData.nombre.toLowerCase() && i.finca === (formData.finca || undefined)
    );
    if (insumoExiste) {
      toast({ title: "Insumo duplicado", description: "Ya existe un insumo con este nombre en la finca seleccionada", variant: "destructive" });
      setErrors(prev => ({ ...prev, nombre: "Este insumo ya existe en esta finca" }));
      setIsSubmitting(false);
      return;
    }

    const newInsumo: Insumo = {
      id: Date.now().toString(),
      nombre: formData.nombre,
      categoria: formData.categoria,
      unidadMedida: formData.unidadMedida,
      stockActual: Number.parseFloat(formData.stockActual),
      stockMinimo: Number.parseFloat(formData.stockMinimo),
      stockMaximo: Number.parseFloat(formData.stockMaximo),
      precioUnitario: Number.parseFloat(formData.precioUnitario),
      proveedor: formData.proveedor,
      finca: formData.finca || undefined,
    };

    addInsumo(newInsumo)
      .then(() => {
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
          categoria: "" as "fertilizante" | "protector" | "herramienta" | "empaque" | "otro",
          unidadMedida: "",
          stockActual: "",
          stockMinimo: "",
          stockMaximo: "",
          precioUnitario: "",
          proveedor: "",
          finca: "" as FincaName | "",
        });
        setErrors({});
      })
      .catch((error: Error) => {
        console.error("Error al guardar insumo:", error);
        toast({
          title: "Error al guardar",
          description: error?.message || "No se pudo crear el insumo",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
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
                <Label htmlFor="nombre" className="font-medium">Nombre del Insumo *</Label>
                <p className="text-xs text-muted-foreground">Identificador único del producto</p>
                <Input
                  id="nombre"
                  className={`h-11 w-full ${getInputClassName(errors, touched, "nombre", formData.nombre)}`}
                  value={formData.nombre}
                  onChange={(e) => handleFieldChange("nombre", e.target.value)}
                  onBlur={(e) => handleFieldBlur("nombre", e.target.value)}
                  disabled={isSubmitting || !allowEdit}
                  required
                />
                <FieldFeedback
                  error={errors.nombre}
                  touched={touched.nombre}
                  isValid={!errors.nombre && !!formData.nombre}
                  successMessage="Nombre válido"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria" className="font-medium">Categoría *</Label>
                <p className="text-xs text-muted-foreground">Tipo de insumo</p>
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
                <Label htmlFor="unidadMedida" className="font-medium">Unidad de Medida *</Label>
                <p className="text-xs text-muted-foreground">Forma de medir el stock</p>
                <Select
                  value={formData.unidadMedida}
                  onValueChange={(value) => {
                    setFormData({ ...formData, unidadMedida: value });
                    setErrors(prev => ({ ...prev, unidadMedida: "" }));
                    setTouched(prev => ({ ...prev, unidadMedida: true }));
                  }}
                  disabled={isSubmitting || !allowEdit}
                  required
                >
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Seleccionar unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilogramos (kg)</SelectItem>
                    <SelectItem value="L">Litros (L)</SelectItem>
                    <SelectItem value="unidades">Unidades</SelectItem>
                    <SelectItem value="rollos">Rollos</SelectItem>
                    <SelectItem value="pares">Pares</SelectItem>
                    <SelectItem value="cajas">Cajas</SelectItem>
                    <SelectItem value="galones">Galones</SelectItem>
                    <SelectItem value="sacos">Sacos</SelectItem>
                  </SelectContent>
                </Select>
                {errors.unidadMedida && (
                  <p className="text-xs text-red-600">{errors.unidadMedida}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stockActual" className="font-medium">Stock Actual *</Label>
                <p className="text-xs text-muted-foreground">Cantidad disponible ahora</p>
                <Input
                  id="stockActual"
                  type="number"
                  step="0.01"
                  min="0"
                  className={`h-11 w-[160px] sm:w-[180px] xl:w-full ${getInputClassName(errors, touched, "stockActual", formData.stockActual)}`}
                  value={formData.stockActual}
                  onChange={(e) => handleFieldChange("stockActual", e.target.value)}
                  onBlur={(e) => handleFieldBlur("stockActual", e.target.value)}
                  disabled={isSubmitting || !allowEdit}
                  required
                />
                <FieldFeedback
                  error={errors.stockActual}
                  touched={touched.stockActual}
                  isValid={!errors.stockActual && !!formData.stockActual}
                  successMessage="Stock válido"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockMinimo" className="font-medium">Stock Mínimo *</Label>
              <p className="text-xs text-muted-foreground">Nivel para generar alerta</p>
              <Input
                id="stockMinimo"
                type="number"
                step="0.01"
                min="0"
                className={`h-11 w-[160px] sm:w-[180px] xl:w-full ${getInputClassName(errors, touched, "stockMinimo", formData.stockMinimo)}`}
                value={formData.stockMinimo}
                onChange={(e) => handleFieldChange("stockMinimo", e.target.value)}
                onBlur={(e) => handleFieldBlur("stockMinimo", e.target.value)}
                disabled={isSubmitting || !allowEdit}
                required
              />
              <FieldFeedback
                error={errors.stockMinimo}
                touched={touched.stockMinimo}
                isValid={!errors.stockMinimo && !!formData.stockMinimo}
                successMessage="Stock mínimo válido"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockMaximo" className="font-medium">Stock Máximo *</Label>
              <p className="text-xs text-muted-foreground">Capacidad máxima de almacenamiento</p>
              <Input
                id="stockMaximo"
                type="number"
                step="0.01"
                min="0"
                className={`h-11 w-[160px] sm:w-[180px] xl:w-full ${getInputClassName(errors, touched, "stockMaximo", formData.stockMaximo)}`}
                value={formData.stockMaximo}
                onChange={(e) => handleFieldChange("stockMaximo", e.target.value)}
                onBlur={(e) => handleFieldBlur("stockMaximo", e.target.value)}
                disabled={isSubmitting || !allowEdit}
                required
              />
              <FieldFeedback
                error={errors.stockMaximo}
                touched={touched.stockMaximo}
                isValid={!errors.stockMaximo && !!formData.stockMaximo}
                successMessage="Stock máximo válido"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="precioUnitario" className="font-medium">Precio Unitario ($) *</Label>
              <p className="text-xs text-muted-foreground">Costo por unidad de medida</p>
              <Input
                id="precioUnitario"
                type="number"
                step="0.01"
                min="0"
                className={`h-11 w-[160px] sm:w-[180px] xl:w-full ${getInputClassName(errors, touched, "precioUnitario", formData.precioUnitario)}`}
                value={formData.precioUnitario}
                onChange={(e) => handleFieldChange("precioUnitario", e.target.value)}
                onBlur={(e) => handleFieldBlur("precioUnitario", e.target.value)}
                disabled={isSubmitting || !allowEdit}
                required
              />
              <FieldFeedback
                error={errors.precioUnitario}
                touched={touched.precioUnitario}
                isValid={!errors.precioUnitario && !!formData.precioUnitario}
                successMessage="Precio válido"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="proveedor" className="font-medium">Proveedor *</Label>
              <p className="text-xs text-muted-foreground">Empresa o persona que suministra</p>
              <Input
                id="proveedor"
                className={`h-11 ${getInputClassName(errors, touched, "proveedor", formData.proveedor)}`}
                value={formData.proveedor}
                onChange={(e) => handleFieldChange("proveedor", e.target.value)}
                onBlur={(e) => handleFieldBlur("proveedor", e.target.value)}
                disabled={isSubmitting || !allowEdit}
                required
              />
              <FieldFeedback
                error={errors.proveedor}
                touched={touched.proveedor}
                isValid={!errors.proveedor && !!formData.proveedor}
                successMessage="Proveedor válido"
              />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="finca" className="font-medium">Finca Asociada</Label>
              <p className="text-xs text-muted-foreground">Opcional - asignar a finca específica</p>
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
