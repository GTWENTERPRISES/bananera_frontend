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
import type { FincaName, RecuperacionCinta } from "@/src/lib/types"; // Cambia Finca por FincaName y agrega RecuperacionCinta
import { Calculator, AlertTriangle } from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";
import { RecuperacionCintaSchema } from "@/src/lib/validation";
import { FieldFeedback, getInputClassName } from "@/src/components/ui/field-feedback";
import { cn } from "@/src/lib/utils";
import { useApp } from "@/src/contexts/app-context";
import { Spinner } from "@/src/components/ui/spinner";

export function RecuperacionForm() {
  const { addRecuperacionCinta, canAccess, recuperacionCintas, fincas } = useApp();
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
    colorCinta: "",
    enfundesIniciales: "",
    primeraCalCosecha: "",
    segundaCalCosecha: "",
    terceraCalCosecha: "",
    barridaFinal: "",
  });

  useEffect(() => {
    const qp = searchParams.get("finca") || "";
    if (isValidFinca(qp)) {
      setFormData((prev) => ({ ...prev, finca: qp as FincaName }));
    }
  }, [searchParams]);

  const primeraCalSaldo =
    Number.parseInt(formData.enfundesIniciales || "0") -
    Number.parseInt(formData.primeraCalCosecha || "0");
  const segundaCalSaldo =
    primeraCalSaldo - Number.parseInt(formData.segundaCalCosecha || "0");
  const terceraCalSaldo =
    segundaCalSaldo - Number.parseInt(formData.terceraCalCosecha || "0");

  const totalRecuperado =
    Number.parseInt(formData.primeraCalCosecha || "0") +
    Number.parseInt(formData.segundaCalCosecha || "0") +
    Number.parseInt(formData.terceraCalCosecha || "0") +
    Number.parseInt(formData.barridaFinal || "0");

  const porcentajeRecuperacion =
    Number.parseInt(formData.enfundesIniciales || "0") > 0
      ? (totalRecuperado / Number.parseInt(formData.enfundesIniciales || "0")) *
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
      const weeksForFinca = recuperacionCintas
        .filter((r) => {
          const matchFinca = r.finca === value || r.finca === fincaNombre;
          return matchFinca && r.año === añoActual;
        })
        .map((r) => r.semana)
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
        colorCinta: formData.colorCinta,
        enfundesIniciales: formData.enfundesIniciales,
        primeraCalCosecha: formData.primeraCalCosecha,
        segundaCalCosecha: formData.segundaCalCosecha,
        terceraCalCosecha: formData.terceraCalCosecha,
        barridaFinal: formData.barridaFinal,
        [field]: value,
      };
      const parsed = RecuperacionCintaSchema.safeParse(dataToValidate);
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

  const allowEdit = canAccess("produccion", "edit");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!allowEdit) {
      toast({ title: "Permiso requerido", description: "Tu rol no puede registrar recuperación", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    // Validar que finca sea un valor válido
    const parsed = RecuperacionCintaSchema.safeParse({
      finca: formData.finca || "",
      semana: formData.semana,
      año: formData.año,
      colorCinta: formData.colorCinta,
      enfundesIniciales: formData.enfundesIniciales,
      primeraCalCosecha: formData.primeraCalCosecha,
      segundaCalCosecha: formData.segundaCalCosecha,
      terceraCalCosecha: formData.terceraCalCosecha,
      barridaFinal: formData.barridaFinal,
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

    // Crear el objeto de recuperación
    const newRecuperacion: RecuperacionCinta = {
      id: Date.now().toString(),
      finca: formData.finca as FincaName,
      semana: Number.parseInt(formData.semana),
      año: Number.parseInt(formData.año),
      fecha: new Date().toISOString().split("T")[0],
      colorCinta: formData.colorCinta,
      enfundesIniciales: Number.parseInt(formData.enfundesIniciales),
      primeraCalCosecha: Number.parseInt(formData.primeraCalCosecha),
      primeraCalSaldo,
      segundaCalCosecha: Number.parseInt(formData.segundaCalCosecha),
      segundaCalSaldo,
      terceraCalCosecha: Number.parseInt(formData.terceraCalCosecha),
      terceraCalSaldo,
      barridaFinal: Number.parseInt(formData.barridaFinal),
      porcentajeRecuperacion: Number.parseFloat(
        porcentajeRecuperacion.toFixed(1)
      ),
    };

    const dup = recuperacionCintas.some(
      (r) => r.finca === newRecuperacion.finca && r.semana === newRecuperacion.semana && r.año === newRecuperacion.año
    );
    if (dup) {
      toast({ title: "Registro duplicado", description: "Ya existe una recuperación para esa finca/semana/año", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    addRecuperacionCinta(newRecuperacion);

    if (porcentajeRecuperacion < 80) {
      toast({
        title: "Alerta: Recuperación Baja",
        description: `La recuperación de ${porcentajeRecuperacion.toFixed(
          1
        )}% está por debajo del 80% esperado`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Recuperación registrada",
        description: `Recuperación: ${porcentajeRecuperacion.toFixed(1)}%`,
      });
    }

    // Reset form
    setFormData({
      finca: undefined as string | undefined,
      semana: "",
      año: new Date().getFullYear().toString(),
      colorCinta: "",
      enfundesIniciales: "",
      primeraCalCosecha: "",
      segundaCalCosecha: "",
      terceraCalCosecha: "",
      barridaFinal: "",
    });
    setErrors({});
    setRegisteredWeeks([]);
    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seguimiento de Recuperación de Cintas</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="colorCinta">Color de Cinta *</Label>
              <p className="text-xs text-muted-foreground">Color de la cinta a recuperar</p>
              <Select
                value={formData.colorCinta}
                onValueChange={(value) =>
                  (setFormData({ ...formData, colorCinta: value }), setErrors((prev) => ({ ...prev, colorCinta: "" })))
                }
                disabled={isSubmitting}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="azul">Azul</SelectItem>
                  <SelectItem value="rojo">Rojo</SelectItem>
                  <SelectItem value="verde">Verde</SelectItem>
                  <SelectItem value="amarillo">Amarillo</SelectItem>
                  <SelectItem value="blanco">Blanco</SelectItem>
                  <SelectItem value="naranja">Naranja</SelectItem>
                </SelectContent>
              </Select>
              {errors.colorCinta && (
                <p className="text-xs text-red-600">{errors.colorCinta}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="enfundesIniciales">Enfundes Iniciales *</Label>
              <p className="text-xs text-muted-foreground">Total de enfundes colocados a recuperar</p>
              <Input
                id="enfundesIniciales"
                type="number"
                min="0"
                value={formData.enfundesIniciales}
                onChange={(e) => handleFieldChange("enfundesIniciales", e.target.value)}
                onBlur={(e) => handleFieldBlur("enfundesIniciales", e.target.value)}
                disabled={isSubmitting}
                required
                className={getInputClassName(errors, touched, "enfundesIniciales", formData.enfundesIniciales)}
              />
              <FieldFeedback
                error={errors.enfundesIniciales}
                touched={touched.enfundesIniciales}
                isValid={!errors.enfundesIniciales && !!formData.enfundesIniciales}
                successMessage="Cantidad válida"
              />
            </div>
          </div>

          <div className="space-y-4 rounded-lg border border-border p-4">
            <h3 className="font-medium text-foreground">Calibraciones</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="primeraCalCosecha">1ª Calibración - Cosecha *</Label>
              <p className="text-xs text-muted-foreground">Cintas recuperadas en primera calibración</p>
              <Input
                id="primeraCalCosecha"
                type="number"
                min="0"
                value={formData.primeraCalCosecha}
                onChange={(e) => handleFieldChange("primeraCalCosecha", e.target.value)}
                onBlur={(e) => handleFieldBlur("primeraCalCosecha", e.target.value)}
                disabled={isSubmitting}
                required
                className={getInputClassName(errors, touched, "primeraCalCosecha", formData.primeraCalCosecha)}
              />
              <FieldFeedback
                error={errors.primeraCalCosecha}
                touched={touched.primeraCalCosecha}
                isValid={!errors.primeraCalCosecha && !!formData.primeraCalCosecha}
                successMessage="Cantidad válida"
              />
            </div>
              <div className="space-y-2">
                <Label>1ª Calibración - Saldo</Label>
                <Input value={primeraCalSaldo} disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="segundaCalCosecha">2ª Calibración - Cosecha *</Label>
              <p className="text-xs text-muted-foreground">Cintas recuperadas en segunda calibración</p>
              <Input
                id="segundaCalCosecha"
                type="number"
                min="0"
                value={formData.segundaCalCosecha}
                onChange={(e) => handleFieldChange("segundaCalCosecha", e.target.value)}
                onBlur={(e) => handleFieldBlur("segundaCalCosecha", e.target.value)}
                disabled={isSubmitting}
                required
                className={getInputClassName(errors, touched, "segundaCalCosecha", formData.segundaCalCosecha)}
              />
              <FieldFeedback
                error={errors.segundaCalCosecha}
                touched={touched.segundaCalCosecha}
                isValid={!errors.segundaCalCosecha && !!formData.segundaCalCosecha}
                successMessage="Cantidad válida"
              />
            </div>
              <div className="space-y-2">
                <Label>2ª Calibración - Saldo</Label>
                <Input value={segundaCalSaldo} disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="terceraCalCosecha">3ª Calibración - Cosecha *</Label>
              <p className="text-xs text-muted-foreground">Cintas recuperadas en tercera calibración</p>
              <Input
                id="terceraCalCosecha"
                type="number"
                min="0"
                value={formData.terceraCalCosecha}
                onChange={(e) => handleFieldChange("terceraCalCosecha", e.target.value)}
                onBlur={(e) => handleFieldBlur("terceraCalCosecha", e.target.value)}
                disabled={isSubmitting}
                required
                className={getInputClassName(errors, touched, "terceraCalCosecha", formData.terceraCalCosecha)}
              />
              <FieldFeedback
                error={errors.terceraCalCosecha}
                touched={touched.terceraCalCosecha}
                isValid={!errors.terceraCalCosecha && !!formData.terceraCalCosecha}
                successMessage="Cantidad válida"
              />
            </div>
              <div className="space-y-2">
                <Label>3ª Calibración - Saldo</Label>
                <Input value={terceraCalSaldo} disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="barridaFinal">Barrida Final *</Label>
              <p className="text-xs text-muted-foreground">Cintas recuperadas en barrida final</p>
              <Input
                id="barridaFinal"
                type="number"
                min="0"
                value={formData.barridaFinal}
                onChange={(e) => handleFieldChange("barridaFinal", e.target.value)}
                onBlur={(e) => handleFieldBlur("barridaFinal", e.target.value)}
                disabled={isSubmitting}
                required
                className={getInputClassName(errors, touched, "barridaFinal", formData.barridaFinal)}
              />
              <FieldFeedback
                error={errors.barridaFinal}
                touched={touched.barridaFinal}
                isValid={!errors.barridaFinal && !!formData.barridaFinal}
                successMessage="Cantidad válida"
              />
            </div>
            </div>
          </div>

          <div
            className={cn(
              "rounded-lg border p-4",
              porcentajeRecuperacion < 80
                ? "border-red-600 bg-red-50 dark:bg-red-950/20"
                : "border-primary bg-primary/10"
            )}
          >
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              {porcentajeRecuperacion < 80 ? (
                <>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-red-600">
                    Alerta: Recuperación Baja
                  </span>
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 text-primary" />
                  <span className="text-primary">Resultados</span>
                </>
              )}
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">
                  Total Recuperado
                </p>
                <p className="text-lg font-bold text-foreground">
                  {totalRecuperado}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Porcentaje de Recuperación
                </p>
                <p
                  className={cn(
                    "text-lg font-bold",
                    porcentajeRecuperacion < 80
                      ? "text-red-600"
                      : "text-green-600"
                  )}
                >
                  {porcentajeRecuperacion.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full gap-2" disabled={!allowEdit || isSubmitting}>
            {isSubmitting ? <Spinner className="h-4 w-4" /> : <Calculator className="h-4 w-4" />}
            Registrar Recuperación
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
