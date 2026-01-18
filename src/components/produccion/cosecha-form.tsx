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
import type { Cosecha, FincaName } from "@/src/lib/types";
import { Calculator } from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";
import { CosechaSchema } from "@/src/lib/validation";
import { Spinner } from "@/src/components/ui/spinner";
import { FieldFeedback, getInputClassName } from "@/src/components/ui/field-feedback";

export function CosechaForm() {
  const { addCosecha, getFilteredCosechas, fincas } = useApp();
  const cosechas = getFilteredCosechas();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [registeredWeeks, setRegisteredWeeks] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    finca: undefined as string | undefined,
    semana: "",
    año: new Date().getFullYear().toString(),
    racimosCorta: "", // Cambiado a racimosCorta
    racimosRechazados: "",
    cajasProducidas: "",
    pesoPromedio: "",
    calibracion: "",
    numeroManos: "",
  });

  useEffect(() => {
    const qp = searchParams.get("finca") || "";
    if (isValidFinca(qp)) {
      setFormData((prev) => ({ ...prev, finca: qp as FincaName }));
    }
  }, [searchParams]);

  const racimosRecuperados =
    Number.parseInt(formData.racimosCorta || "0") -
    Number.parseInt(formData.racimosRechazados || "0");
  const ratio =
    racimosRecuperados > 0
      ? Number.parseInt(formData.cajasProducidas || "0") / racimosRecuperados
      : 0;
  const merma =
    Number.parseInt(formData.racimosCorta || "0") > 0
      ? (Number.parseInt(formData.racimosRechazados || "0") /
          Number.parseInt(formData.racimosCorta || "0")) *
        100
      : 0;

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
      setFormData({ ...formData, finca: value, semana: "" });
      setErrors(prev => ({ ...prev, finca: "" }));
      
      // Filtrar semanas ya registradas para esta finca y año
      const añoActual = Number.parseInt(formData.año);
      const fincaNombre = getFincaNombre(value);
      const weeksForFinca = cosechas
        .filter((c) => {
          const matchFinca = c.finca === value || c.finca === fincaNombre || c.fincaNombre === fincaNombre;
          return matchFinca && c.año === añoActual;
        })
        .map((c) => c.semana)
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort((a, b) => a - b);
      setRegisteredWeeks(weeksForFinca);
    } else {
      setFormData({ ...formData, finca: undefined });
    }
    setTouched(prev => ({ ...prev, finca: true }));
  };

  const validateField = (field: string, value: any): string => {
    try {
      const dataToValidate = {
        finca: formData.finca || "",
        semana: formData.semana,
        año: formData.año,
        racimosCorta: formData.racimosCorta,
        racimosRechazados: formData.racimosRechazados,
        cajasProducidas: formData.cajasProducidas,
        pesoPromedio: formData.pesoPromedio,
        calibracion: formData.calibracion,
        numeroManos: formData.numeroManos,
        [field]: value,
      };
      const parsed = CosechaSchema.safeParse(dataToValidate);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const parsed = CosechaSchema.safeParse({
      finca: formData.finca || "",
      semana: formData.semana,
      año: formData.año,
      racimosCorta: formData.racimosCorta,
      racimosRechazados: formData.racimosRechazados,
      cajasProducidas: formData.cajasProducidas,
      pesoPromedio: formData.pesoPromedio,
      calibracion: formData.calibracion,
      numeroManos: formData.numeroManos,
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

    const fincaNombre = getFincaNombre(formData.finca as string);
    const newCosecha: Cosecha = {
      id: Date.now().toString(),
      finca: formData.finca as string,
      fincaNombre,
      semana: Number.parseInt(formData.semana),
      año: Number.parseInt(formData.año),
      fecha: new Date().toISOString().split("T")[0],
      racimosCorta: Number.parseInt(formData.racimosCorta),
      racimosRechazados: Number.parseInt(formData.racimosRechazados),
      racimosRecuperados,
      cajasProducidas: Number.parseInt(formData.cajasProducidas),
      pesoPromedio: Number.parseFloat(formData.pesoPromedio),
      calibracion: Number.parseInt(formData.calibracion),
      numeroManos: Number.parseFloat(formData.numeroManos),
      ratio: Number.parseFloat(ratio.toFixed(2)),
      merma: Number.parseFloat(merma.toFixed(2)),
    };

    // Verificar duplicado por finca + semana + año
    const dup = cosechas.some((c) => {
      const matchFinca = c.finca === newCosecha.finca || c.finca === fincaNombre || c.fincaNombre === fincaNombre;
      return matchFinca && c.semana === newCosecha.semana && c.año === newCosecha.año;
    });
    if (dup) {
      toast({ title: "Registro duplicado", description: `Ya existe una cosecha para ${fincaNombre}, semana ${newCosecha.semana}/${newCosecha.año}`, variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    addCosecha(newCosecha);
    toast({
      title: "Cosecha registrada",
      description: `${fincaNombre} - Semana ${newCosecha.semana} | Ratio: ${ratio.toFixed(2)} | Merma: ${merma.toFixed(2)}%`,
    });

    // Reset form
    setFormData({
      finca: undefined as string | undefined,
      semana: "",
      año: new Date().getFullYear().toString(),
      racimosCorta: "",
      racimosRechazados: "",
      cajasProducidas: "",
      pesoPromedio: "",
      calibracion: "",
      numeroManos: "",
    });
    setErrors({});
    setRegisteredWeeks([]);
    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Cosecha</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="finca">Finca *</Label>
              <Select
                value={formData.finca}
                onValueChange={handleFincaChange}
                disabled={isSubmitting}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar finca" />
                </SelectTrigger>
                <SelectContent>
                  {fincas.map((finca) => (
                    <SelectItem key={finca.id} value={finca.id}>
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
              <Label htmlFor="semana">Semana *</Label>
              <Select
                value={formData.semana}
                onValueChange={(value) => handleFieldChange("semana", value)}
                disabled={isSubmitting || !formData.finca}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.finca ? "Seleccionar semana" : "Primero selecciona finca"} />
                </SelectTrigger>
                <SelectContent>
                  {formData.finca && Array.from({ length: 53 }, (_, i) => i + 1)
                    .filter(week => !registeredWeeks.includes(week))
                    .map((week) => (
                      <SelectItem key={week} value={week.toString()}>
                        Semana {week}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {!formData.finca && (
                <p className="text-xs text-gray-500">Selecciona una finca primero</p>
              )}
              {formData.finca && (
                <p className="text-xs text-blue-600">
                  {53 - registeredWeeks.length} semanas disponibles
                </p>
              )}
              <FieldFeedback
                error={errors.semana}
                touched={touched.semana}
                isValid={!errors.semana && !!formData.semana}
                successMessage="Semana válida"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="racimosCorta">Racimos Cortados *</Label>
              <p className="text-xs text-muted-foreground">Total de racimos cortados en la semana</p>
              <Input
                id="racimosCorta"
                type="number"
                min="0"
                value={formData.racimosCorta}
                onChange={(e) => handleFieldChange("racimosCorta", e.target.value)}
                onBlur={(e) => handleFieldBlur("racimosCorta", e.target.value)}
                disabled={isSubmitting}
                required
                className={getInputClassName(errors, touched, "racimosCorta", formData.racimosCorta)}
              />
              <FieldFeedback
                error={errors.racimosCorta}
                touched={touched.racimosCorta}
                isValid={!errors.racimosCorta && !!formData.racimosCorta}
                successMessage="Cantidad válida"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="racimosRechazados">Racimos Rechazados *</Label>
              <p className="text-xs text-muted-foreground">Racimos que no cumplieron el estándar</p>
              <Input
                id="racimosRechazados"
                type="number"
                min="0"
                value={formData.racimosRechazados}
                onChange={(e) => handleFieldChange("racimosRechazados", e.target.value)}
                onBlur={(e) => handleFieldBlur("racimosRechazados", e.target.value)}
                disabled={isSubmitting}
                required
                className={getInputClassName(errors, touched, "racimosRechazados", formData.racimosRechazados)}
              />
              <FieldFeedback
                error={errors.racimosRechazados}
                touched={touched.racimosRechazados}
                isValid={!errors.racimosRechazados && !!formData.racimosRechazados}
                successMessage="Cantidad válida"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cajasProducidas">Cajas Producidas *</Label>
              <p className="text-xs text-muted-foreground">Total de cajas empacadas y listas</p>
              <Input
                id="cajasProducidas"
                type="number"
                min="0"
                value={formData.cajasProducidas}
                onChange={(e) => handleFieldChange("cajasProducidas", e.target.value)}
                onBlur={(e) => handleFieldBlur("cajasProducidas", e.target.value)}
                disabled={isSubmitting}
                required
                className={getInputClassName(errors, touched, "cajasProducidas", formData.cajasProducidas)}
              />
              <FieldFeedback
                error={errors.cajasProducidas}
                touched={touched.cajasProducidas}
                isValid={!errors.cajasProducidas && !!formData.cajasProducidas}
                successMessage="Cantidad válida"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pesoPromedio">Peso Promedio (lb) *</Label>
              <p className="text-xs text-muted-foreground">Peso promedio por caja en libras</p>
              <Input
                id="pesoPromedio"
                type="number"
                step="0.1"
                min="0"
                value={formData.pesoPromedio}
                onChange={(e) => handleFieldChange("pesoPromedio", e.target.value)}
                onBlur={(e) => handleFieldBlur("pesoPromedio", e.target.value)}
                disabled={isSubmitting}
                required
                className={getInputClassName(errors, touched, "pesoPromedio", formData.pesoPromedio)}
              />
              <FieldFeedback
                error={errors.pesoPromedio}
                touched={touched.pesoPromedio}
                isValid={!errors.pesoPromedio && !!formData.pesoPromedio}
                successMessage="Peso válido"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="calibracion">Calibración *</Label>
              <p className="text-xs text-muted-foreground">Grosor del dedo en 32avos de pulgada</p>
              <Input
                id="calibracion"
                type="number"
                min="0"
                value={formData.calibracion}
                onChange={(e) => handleFieldChange("calibracion", e.target.value)}
                onBlur={(e) => handleFieldBlur("calibracion", e.target.value)}
                disabled={isSubmitting}
                required
                className={getInputClassName(errors, touched, "calibracion", formData.calibracion)}
              />
              <FieldFeedback
                error={errors.calibracion}
                touched={touched.calibracion}
                isValid={!errors.calibracion && !!formData.calibracion}
                successMessage="Calibración válida"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numeroManos">Número de Manos *</Label>
              <p className="text-xs text-muted-foreground">Promedio de manos por racimo</p>
              <Input
                id="numeroManos"
                type="number"
                step="0.1"
                min="0"
                value={formData.numeroManos}
                onChange={(e) => handleFieldChange("numeroManos", e.target.value)}
                onBlur={(e) => handleFieldBlur("numeroManos", e.target.value)}
                disabled={isSubmitting}
                required
                className={getInputClassName(errors, touched, "numeroManos", formData.numeroManos)}
              />
              <FieldFeedback
                error={errors.numeroManos}
                touched={touched.numeroManos}
                isValid={!errors.numeroManos && !!formData.numeroManos}
                successMessage="Número de manos válido"
              />
            </div>
          </div>

          <div className="rounded-lg border border-primary bg-primary/10 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
              <Calculator className="h-4 w-4" />
              Cálculos Automáticos
            </div>
            <div className="grid gap-2 md:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  Racimos Recuperados
                </p>
                <p className="text-lg font-bold text-foreground">
                  {racimosRecuperados}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ratio</p>
                <p className="text-lg font-bold text-foreground">
                  {ratio.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Merma</p>
                <p className="text-lg font-bold text-foreground">
                  {merma.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
            {isSubmitting ? <Spinner className="h-4 w-4" /> : <Calculator className="h-4 w-4" />}
            Registrar Cosecha
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
