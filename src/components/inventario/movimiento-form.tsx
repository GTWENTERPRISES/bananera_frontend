"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import type { MovimientoInventario, FincaName } from "@/src/lib/types"; // Cambia Finca por FincaName
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";
import { MovimientoInventarioSchema } from "@/src/lib/validation";
import { Spinner } from "@/src/components/ui/spinner";
import { FieldFeedback, getInputClassName } from "@/src/components/ui/field-feedback";

export function MovimientoForm() {
  const { addMovimientoInventario, getFilteredInsumos, canAccess, currentUser } = useApp();
  const insumos = getFilteredInsumos();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    insumoId: "",
    tipo: "" as "entrada" | "salida",
    cantidad: "",
    finca: "" as FincaName | "", // Usa FincaName en lugar de Finca
    motivo: "",
    responsable: currentUser?.nombre || "",
  });

  const insumo = insumos.find((i) => i.id === formData.insumoId);
  const isDiscreteUnit = /rollo|unidad|par|caja|pieza/i.test(insumo?.unidadMedida || "");

  // Función helper para validar el tipo FincaName
  const isValidFinca = (value: string): value is FincaName => {
    return ["BABY", "SOLO", "LAURITA", "MARAVILLA"].includes(value);
  };

  // Manejar cambio de finca de forma segura
  const handleFincaChange = (value: string) => {
    if (isValidFinca(value)) {
      setFormData({ ...formData, finca: value });
    } else {
      setFormData({ ...formData, finca: "" as FincaName | "" });
    }
  };

  const allowEdit = canAccess("inventario", "edit");

  const validateField = (field: string, value: any): string => {
    try {
      const dataToValidate = {
        insumoId: formData.insumoId,
        tipo: formData.tipo || "",
        cantidad: formData.cantidad,
        finca: formData.finca || "",
        motivo: formData.motivo,
        responsable: formData.responsable,
        [field]: value,
      };
      const parsed = MovimientoInventarioSchema.safeParse(dataToValidate);
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

  useEffect(() => {
    const insumoId = searchParams.get("insumoId") || "";
    const tipo = (searchParams.get("tipo") || "") as "entrada" | "salida";
    const cantidad = searchParams.get("cantidad") || "";
    const motivo = searchParams.get("motivo") || "";
    const finca = searchParams.get("finca") || "";
    setFormData((prev) => ({
      ...prev,
      insumoId: insumoId || prev.insumoId,
      tipo: tipo || prev.tipo,
      cantidad: cantidad || prev.cantidad,
      motivo: motivo || prev.motivo,
      finca: (finca as FincaName) || prev.finca,
    }));
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!allowEdit) {
      toast({ title: "Permiso requerido", description: "Tu rol no puede registrar movimientos", variant: "destructive" });
      return;
    }

    const parsed = MovimientoInventarioSchema.safeParse({
      insumoId: formData.insumoId,
      tipo: formData.tipo || "",
      cantidad: formData.cantidad,
      finca: formData.finca || "",
      motivo: formData.motivo,
      responsable: formData.responsable,
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

    if (!insumo) {
      toast({
        title: "Error",
        description: "Por favor selecciona un insumo válido",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const cantidad = Number.parseFloat(formData.cantidad);
    const nuevoStock =
      formData.tipo === "entrada"
        ? insumo.stockActual + cantidad
        : insumo.stockActual - cantidad;

    if (formData.tipo === "salida" && nuevoStock < 0) {
      toast({
        title: "Error",
        description: "No hay suficiente stock disponible",
        variant: "destructive",
      });
      return;
    }

    const newMovimiento: MovimientoInventario = {
      id: Date.now().toString(),
      insumoId: formData.insumoId,
      tipo: formData.tipo,
      cantidad: Number(cantidad.toFixed(2)),
      fecha: new Date().toISOString().split("T")[0], // Formato YYYY-MM-DD
      motivo: formData.motivo,
      responsable: formData.responsable,
    };

    addMovimientoInventario(newMovimiento)
      .then(() => {
        toast({
          title: `${formData.tipo === "entrada" ? "Entrada" : "Salida"} registrada`,
          description: `${insumo.nombre}: ${cantidad} ${insumo.unidadMedida}`,
        });
        // Reset form
        setFormData({
          insumoId: "",
          tipo: "" as "entrada" | "salida",
          cantidad: "",
          finca: "" as FincaName | "",
          motivo: "",
          responsable: "",
        });
        setErrors({});
      })
      .catch((error: Error) => {
        console.error("Error al guardar movimiento:", error);
        toast({
          title: "Error al guardar",
          description: error?.message || "No se pudo registrar el movimiento",
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
        <CardTitle>Registrar Movimiento</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="insumo">Insumo *</Label>
              <p className="text-xs text-muted-foreground">Producto a mover</p>
              <Select
                value={formData.insumoId}
                onValueChange={(value) =>
                  (setFormData({ ...formData, insumoId: value }), setErrors((prev) => ({ ...prev, insumoId: "" })))
                }
                disabled={isSubmitting || !allowEdit}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar insumo" />
                </SelectTrigger>
                <SelectContent>
                  {insumos.map((ins) => (
                    <SelectItem key={ins.id} value={ins.id}>
                      {ins.nombre} - Stock: {ins.stockActual} {ins.unidadMedida}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.insumoId && (
                <p className="text-xs text-red-600">{errors.insumoId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Movimiento *</Label>
              <p className="text-xs text-muted-foreground">Entrada o salida de inventario</p>
              <Select
                value={formData.tipo}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    tipo: value as "entrada" | "salida",
                  })
                }
                disabled={isSubmitting || !allowEdit}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="salida">Salida</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipo && (
                <p className="text-xs text-red-600">{errors.tipo}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="finca">Finca *</Label>
              <p className="text-xs text-muted-foreground">Destino u origen del movimiento</p>
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
              {errors.finca && (
                <p className="text-xs text-red-600">{errors.finca}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad {insumo ? `(${insumo.unidadMedida})` : ""} *</Label>
              <p className="text-xs text-muted-foreground">Unidades a registrar</p>
              <Input
                id="cantidad"
                type="number"
                step={isDiscreteUnit ? 1 : 0.01}
                min="0"
                value={formData.cantidad}
                onChange={(e) => handleFieldChange("cantidad", e.target.value)}
                onBlur={(e) => handleFieldBlur("cantidad", e.target.value)}
                disabled={isSubmitting || !allowEdit}
                required
                placeholder={insumo ? (isDiscreteUnit ? `Ej: 10 ${insumo.unidadMedida}` : `Ej: 0.5 ${insumo.unidadMedida}`) : "Ej: cantidad"}
                className={getInputClassName(errors, touched, "cantidad", formData.cantidad)}
              />
              <FieldFeedback
                error={errors.cantidad}
                touched={touched.cantidad}
                isValid={!errors.cantidad && !!formData.cantidad}
                successMessage="Cantidad válida"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsable">Responsable *</Label>
              <p className="text-xs text-muted-foreground">Persona que realiza el movimiento</p>
              <Input
                id="responsable"
                value={formData.responsable}
                onChange={(e) => handleFieldChange("responsable", e.target.value)}
                onBlur={(e) => handleFieldBlur("responsable", e.target.value)}
                disabled={isSubmitting || !allowEdit}
                required
                className={getInputClassName(errors, touched, "responsable", formData.responsable)}
              />
              <FieldFeedback
                error={errors.responsable}
                touched={touched.responsable}
                isValid={!errors.responsable && !!formData.responsable}
                successMessage="Responsable válido"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="motivo">Motivo *</Label>
              <p className="text-xs text-muted-foreground">Razón del movimiento</p>
              <Input
                id="motivo"
                value={formData.motivo}
                onChange={(e) => handleFieldChange("motivo", e.target.value)}
                onBlur={(e) => handleFieldBlur("motivo", e.target.value)}
                placeholder="Ej: Aplicación semanal, compra, etc."
                disabled={isSubmitting || !allowEdit}
                required
                className={getInputClassName(errors, touched, "motivo", formData.motivo)}
              />
              <FieldFeedback
                error={errors.motivo}
                touched={touched.motivo}
                isValid={!errors.motivo && !!formData.motivo}
                successMessage="Motivo válido"
              />
            </div>
          </div>

          {insumo && formData.cantidad && (
            <div className="rounded-lg border border-primary bg-primary/10 p-4">
              <div className="mb-2 text-sm font-medium text-primary">
                Vista Previa
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Stock Actual</p>
                  <p className="text-sm font-medium text-foreground">
                    {insumo.stockActual} {insumo.unidadMedida}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Movimiento</p>
                  <p className="text-sm font-medium text-foreground">
                    {formData.tipo === "entrada" ? "+" : "-"}
                    {formData.cantidad} {insumo.unidadMedida}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Nuevo Stock</p>
                  <p className="text-sm font-bold text-foreground">
                    {formData.tipo === "entrada"
                      ? insumo.stockActual +
                        Number.parseFloat(formData.cantidad)
                      : insumo.stockActual -
                        Number.parseFloat(formData.cantidad)}{" "}
                    {insumo.unidadMedida}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full gap-2"
            disabled={
              !allowEdit ||
              !insumo ||
              !formData.tipo ||
              !formData.cantidad ||
              !formData.responsable ||
              !formData.motivo ||
              isSubmitting
            }
          >
            {isSubmitting ? (
              <Spinner className="h-4 w-4" />
            ) : formData.tipo === "entrada" ? (
              <>
                <ArrowDownCircle className="h-4 w-4" />
                Registrar Entrada
              </>
            ) : (
              <>
                <ArrowUpCircle className="h-4 w-4" />
                Registrar Salida
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
