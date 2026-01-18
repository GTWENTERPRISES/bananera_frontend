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
import type { Enfunde, FincaName } from "@/src/lib/types"; // Cambia Finca por FincaName
import { Plus, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";
import { EnfundeSchema } from "@/src/lib/validation";
import { Spinner } from "@/src/components/ui/spinner";
import { Badge } from "@/src/components/ui/badge";

export function EnfundeForm() {
  const { addEnfunde, getFilteredEnfundes, fincas } = useApp();
  const enfundes = getFilteredEnfundes();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [registeredWeeks, setRegisteredWeeks] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    finca: undefined as string | undefined, // Usar UUID en lugar de FincaName
    semana: "",
    año: new Date().getFullYear().toString(), // Año actual dinámico
    colorCinta: "",
    lote: "",
    cantidadEnfundes: "",
    matasCaidas: "",
    fecha: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const qp = searchParams.get("finca") || "";
    // Buscar finca por nombre
    const finca = fincas.find(f => f.nombre === qp);
    if (finca) {
      setFormData((prev) => ({ ...prev, finca: finca.id }));
    }
  }, [searchParams, fincas]);

  // Validación en vivo de campos individuales
  const validateField = (fieldName: string, value: any) => {
    try {
      // Crear un objeto con todos los datos actuales del formulario
      const dataToValidate = {
        finca: formData.finca || "",
        semana: formData.semana,
        año: formData.año,
        colorCinta: formData.colorCinta,
        cantidadEnfundes: formData.cantidadEnfundes,
        matasCaidas: formData.matasCaidas,
        fecha: formData.fecha,
        [fieldName]: value,
      };

      // Validar con el schema
      const parsed = EnfundeSchema.safeParse(dataToValidate);
      
      if (!parsed.success) {
        const fieldError = parsed.error.flatten().fieldErrors[fieldName];
        if (fieldError && fieldError.length > 0) {
          return String(fieldError[0]);
        }
      }
      return "";
    } catch (error) {
      return "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const parsed = EnfundeSchema.safeParse({
      finca: formData.finca || "",
      semana: formData.semana,
      año: formData.año,
      colorCinta: formData.colorCinta,
      cantidadEnfundes: formData.cantidadEnfundes,
      matasCaidas: formData.matasCaidas,
      fecha: formData.fecha,
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

    const newEnfunde: Enfunde = {
      id: Date.now().toString(),
      finca: formData.finca as string, // UUID de la finca
      fincaNombre: getFincaNombre(formData.finca as string),
      semana: Number.parseInt(formData.semana),
      año: Number.parseInt(formData.año),
      colorCinta: formData.colorCinta,
      lote: formData.lote || undefined,
      cantidadEnfundes: Number.parseInt(formData.cantidadEnfundes),
      matasCaidas: Number.parseInt(formData.matasCaidas),
      fecha: formData.fecha,
    };

    // La restricción unique es: finca + semana + año (solo un registro por semana)
    const fincaNombre = getFincaNombre(newEnfunde.finca);
    const dup = enfundes.some((e) => {
      const matchFinca = e.finca === newEnfunde.finca || e.finca === fincaNombre || e.fincaNombre === fincaNombre;
      return matchFinca && 
             e.semana === newEnfunde.semana && 
             e.año === newEnfunde.año;
    });
    if (dup) {
      toast({ 
        title: "Registro duplicado", 
        description: `Ya existe un enfunde para ${fincaNombre}, semana ${newEnfunde.semana}/${newEnfunde.año}`, 
        variant: "destructive" 
      });
      setIsSubmitting(false);
      return;
    }

    addEnfunde(newEnfunde)
      .then(() => {
        toast({
          title: "Enfunde registrado",
          description: `Se registraron ${formData.cantidadEnfundes} enfundes en ${formData.finca}`,
        });

        // Reset form
        setFormData({
          finca: undefined as string | undefined,
          semana: "",
          año: new Date().getFullYear().toString(),
          colorCinta: "",
          lote: "",
          cantidadEnfundes: "",
          matasCaidas: "",
          fecha: new Date().toISOString().split("T")[0],
        });
        setErrors({});
        setTouched({});
        setRegisteredWeeks([]);
      })
      .catch((error) => {
        console.error("Error al guardar enfunde:", error);
        toast({
          title: "Error al guardar",
          description: error?.message || "No se pudo crear el enfunde. Verifica los datos.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  // Función helper para validar UUID de finca
  const isValidFinca = (value: string): boolean => {
    return fincas.some(f => f.id === value);
  };
  
  // Helper para obtener el nombre de la finca por UUID
  const getFincaNombre = (fincaId: string): string => {
    return fincas.find(f => f.id === fincaId)?.nombre || fincaId;
  };

  // Manejar cambio de finca de forma segura con validación en vivo
  const handleFincaChange = (value: string) => {
    if (isValidFinca(value)) {
      setFormData({ ...formData, finca: value, semana: "" }); // Resetear semana
      const error = validateField("finca", value);
      setErrors((prev) => ({ ...prev, finca: error }));
      setTouched((prev) => ({ ...prev, finca: true }));
      
      // Filtrar las semanas ya registradas para esta finca y año (solo una por semana)
      const añoActual = Number.parseInt(formData.año);
      const fincaNombre = getFincaNombre(value);
      
      const weeksForFinca = enfundes
        .filter((e) => {
          // Comparar por UUID o por nombre de finca (para compatibilidad)
          const matchFinca = e.finca === value || e.finca === fincaNombre || e.fincaNombre === fincaNombre;
          return matchFinca && e.año === añoActual;
        })
        .map((e) => e.semana)
        .filter((v, i, a) => a.indexOf(v) === i) // Eliminar duplicados
        .sort((a, b) => a - b);
      
      setRegisteredWeeks(weeksForFinca);
      
      // Limpiar error de semana
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.semana;
        return newErrors;
      });
      setTouched((prev) => ({ ...prev, semana: false }));
    } else {
      setFormData({ ...formData, finca: undefined });
      setErrors((prev) => ({ ...prev, finca: "Selecciona una finca válida" }));
      setTouched((prev) => ({ ...prev, finca: true }));
      setRegisteredWeeks([]);
    }
  };

  // Handler genérico para campos con validación en vivo
  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    
    // Validar el campo actual
    if (touched[fieldName] || value !== "") {
      const error = validateField(fieldName, value);
      setErrors((prev) => ({ ...prev, [fieldName]: error }));
    }
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    
    // VALIDACIÓN EN CASCADA: Validar campos dependientes
    
    // La semana ya está filtrada en el selector, no necesita validación de duplicados
    
    // Si es el año, actualizar semanas y resetear semana
    if (fieldName === "año" && formData.finca) {
      const fincaNombre = getFincaNombre(formData.finca);
      const weeksForFinca = enfundes
        .filter((e) => {
          const matchFinca = e.finca === formData.finca || e.finca === fincaNombre || e.fincaNombre === fincaNombre;
          return matchFinca && e.año === Number.parseInt(value);
        })
        .map((e) => e.semana)
        .sort((a, b) => a - b);
      setRegisteredWeeks(weeksForFinca);
      
      // Resetear semana para que el usuario la vuelva a seleccionar
      setFormData((prev) => ({ ...prev, semana: "" }));
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.semana;
        return newErrors;
      });
      setTouched((prev) => ({ ...prev, semana: false }));
    }
    
    // Si cambia color de cinta, validar que finca y semana estén completos
    if (fieldName === "colorCinta" && value) {
      if (!formData.finca) {
        setErrors((prev) => ({ ...prev, finca: "Selecciona una finca primero" }));
        setTouched((prev) => ({ ...prev, finca: true }));
      }
      if (!formData.semana) {
        setErrors((prev) => ({ ...prev, semana: "Ingresa la semana primero" }));
        setTouched((prev) => ({ ...prev, semana: true }));
      }
    }
    
    // Si cambia cantidad de enfundes, validar campos anteriores
    if (fieldName === "cantidadEnfundes" && value) {
      if (!formData.finca) {
        setErrors((prev) => ({ ...prev, finca: "Selecciona una finca primero" }));
        setTouched((prev) => ({ ...prev, finca: true }));
      }
      if (!formData.semana) {
        setErrors((prev) => ({ ...prev, semana: "Ingresa la semana primero" }));
        setTouched((prev) => ({ ...prev, semana: true }));
      }
      if (!formData.colorCinta) {
        setErrors((prev) => ({ ...prev, colorCinta: "Selecciona el color de cinta primero" }));
        setTouched((prev) => ({ ...prev, colorCinta: true }));
      }
    }
  };

  // Handler para onBlur (cuando el usuario sale del campo)
  const handleFieldBlur = (fieldName: string, value: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    const error = validateField(fieldName, value);
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
  };

  return (
    <Card className="responsive-card">
      <CardHeader>
        <CardTitle>Registrar Enfunde</CardTitle>
      </CardHeader>
      <CardContent className="responsive-form">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="finca">Finca *</Label>
              <Select
                value={formData.finca}
                onValueChange={handleFincaChange}
                disabled={isSubmitting}
                required
              >
                <SelectTrigger className={`h-11 ${errors.finca && touched.finca ? 'border-red-500' : touched.finca && !errors.finca ? 'border-green-500' : ''}`}>
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
              {errors.finca && touched.finca && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.finca}
                </p>
              )}
              {!errors.finca && touched.finca && formData.finca && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Finca válida
                </p>
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
                <SelectTrigger className={`h-11 ${errors.semana && touched.semana ? 'border-red-500' : touched.semana && !errors.semana && formData.semana ? 'border-green-500' : ''}`}>
                  <SelectValue placeholder={formData.finca ? "Seleccionar semana disponible" : "Primero selecciona una finca"} />
                </SelectTrigger>
                <SelectContent>
                  {formData.finca && Array.from({ length: 53 }, (_, i) => i + 1)
                    .filter(week => !registeredWeeks.includes(week))
                    .map((week) => (
                      <SelectItem key={week} value={week.toString()}>
                        Semana {week}
                      </SelectItem>
                    ))}
                  {formData.finca && registeredWeeks.length === 53 && (
                    <SelectItem value="" disabled>
                      No hay semanas disponibles
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.semana && touched.semana && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.semana}
                </p>
              )}
              {!errors.semana && touched.semana && formData.semana && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Semana {formData.semana} seleccionada
                </p>
              )}
              {!formData.finca && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Selecciona una finca primero
                </p>
              )}
              {formData.finca && (
                <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                  <Info className="h-3 w-3" />
                  {registeredWeeks.length > 0 
                    ? `${53 - registeredWeeks.length} semanas disponibles de 53 (${registeredWeeks.length} ya registradas)`
                    : `Todas las semanas están disponibles (53)`}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="colorCinta">Color de Cinta *</Label>
              <p className="text-xs text-muted-foreground mb-1">Color de la cinta usada para identificar la semana de enfunde</p>
              <Select
                value={formData.colorCinta}
                onValueChange={(value) => {
                  handleFieldChange("colorCinta", value);
                }}
                disabled={isSubmitting}
                required
              >
                <SelectTrigger className={`h-11 ${errors.colorCinta && touched.colorCinta ? 'border-red-500' : touched.colorCinta && !errors.colorCinta && formData.colorCinta ? 'border-green-500' : ''}`}>
                  <SelectValue placeholder="Seleccionar color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="azul">Azul</SelectItem>
                  <SelectItem value="rojo">Rojo</SelectItem>
                  <SelectItem value="amarillo">Amarillo</SelectItem>
                  <SelectItem value="verde">Verde</SelectItem>
                  <SelectItem value="naranja">Naranja</SelectItem>
                  <SelectItem value="morado">Morado</SelectItem>
                  <SelectItem value="rosado">Rosado</SelectItem>
                  <SelectItem value="blanco">Blanco</SelectItem>
                </SelectContent>
              </Select>
              {errors.colorCinta && touched.colorCinta && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.colorCinta}
                </p>
              )}
              {!errors.colorCinta && touched.colorCinta && formData.colorCinta && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Color válido
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lote">Lote (Opcional)</Label>
              <p className="text-xs text-muted-foreground mb-1">Sector específico de la finca (A-E)</p>
              <Select
                value={formData.lote}
                onValueChange={(value) =>
                  setFormData({ ...formData, lote: value })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Seleccionar lote" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Lote A</SelectItem>
                  <SelectItem value="B">Lote B</SelectItem>
                  <SelectItem value="C">Lote C</SelectItem>
                  <SelectItem value="D">Lote D</SelectItem>
                  <SelectItem value="E">Lote E</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cantidadEnfundes">Cantidad de Enfundes *</Label>
              <p className="text-xs text-muted-foreground mb-1">Total de fundas colocadas en esta semana</p>
              <Input
                id="cantidadEnfundes"
                type="number"
                min="0"
                value={formData.cantidadEnfundes}
                onChange={(e) => handleFieldChange("cantidadEnfundes", e.target.value)}
                onBlur={(e) => handleFieldBlur("cantidadEnfundes", e.target.value)}
                disabled={isSubmitting}
                required
                className={`h-11 ${errors.cantidadEnfundes && touched.cantidadEnfundes ? 'border-red-500' : touched.cantidadEnfundes && !errors.cantidadEnfundes && formData.cantidadEnfundes ? 'border-green-500' : ''}`}
                placeholder="Ej: 1500"
              />
              {errors.cantidadEnfundes && touched.cantidadEnfundes && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.cantidadEnfundes}
                </p>
              )}
              {!errors.cantidadEnfundes && touched.cantidadEnfundes && formData.cantidadEnfundes && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Cantidad válida
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="matasCaidas">Matas Caídas *</Label>
              <p className="text-xs text-muted-foreground mb-1">Plantas caídas o perdidas durante el enfunde</p>
              <Input
                id="matasCaidas"
                type="number"
                min="0"
                value={formData.matasCaidas}
                onChange={(e) => handleFieldChange("matasCaidas", e.target.value)}
                onBlur={(e) => handleFieldBlur("matasCaidas", e.target.value)}
                disabled={isSubmitting}
                required
                className={`h-11 ${errors.matasCaidas && touched.matasCaidas ? 'border-red-500' : touched.matasCaidas && !errors.matasCaidas && formData.matasCaidas ? 'border-green-500' : ''}`}
                placeholder="Ej: 10"
              />
              {errors.matasCaidas && touched.matasCaidas && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.matasCaidas}
                </p>
              )}
              {!errors.matasCaidas && touched.matasCaidas && formData.matasCaidas && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Cantidad válida
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha de Ejecución *</Label>
              <p className="text-xs text-muted-foreground mb-1">Día en que se realizó el enfunde (formato YYYY-MM-DD)</p>
              <Input
                id="fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) => handleFieldChange("fecha", e.target.value)}
                onBlur={(e) => handleFieldBlur("fecha", e.target.value)}
                disabled={isSubmitting}
                required
                className={`h-11 ${errors.fecha && touched.fecha ? 'border-red-500' : touched.fecha && !errors.fecha && formData.fecha ? 'border-green-500' : ''}`}
              />
              {errors.fecha && touched.fecha && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.fecha}
                </p>
              )}
              {!errors.fecha && touched.fecha && formData.fecha && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Fecha válida
                </p>
              )}
            </div>
          </div>

          {(() => {
            const camposRequeridos = !formData.finca || !formData.semana || !formData.colorCinta || !formData.cantidadEnfundes || !formData.matasCaidas || !formData.fecha;
            const tieneErrores = Object.keys(errors).some(key => errors[key]);
            const deshabilitado = isSubmitting || camposRequeridos || tieneErrores;
            
            return (
              <>
                <Button 
                  type="submit" 
                  className="w-full gap-2 h-11 text-base" 
                  disabled={deshabilitado}
                >
                  {isSubmitting ? <Spinner className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {isSubmitting ? "Guardando..." : "Registrar Enfunde"}
                </Button>
                
                {camposRequeridos && !isSubmitting && (
                  <div className="text-sm text-gray-500 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                    <Info className="h-4 w-4" />
                    Completa todos los campos requeridos (*)
                  </div>
                )}
                
                {tieneErrores && !camposRequeridos && (
                  <div className="text-sm text-amber-600 flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md">
                    <AlertCircle className="h-4 w-4" />
                    Por favor corrige los errores antes de enviar
                  </div>
                )}
              </>
            );
          })()}
        </form>
      </CardContent>
    </Card>
  );
}
