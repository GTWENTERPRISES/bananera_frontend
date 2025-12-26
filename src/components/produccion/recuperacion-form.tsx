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
import { cn } from "@/src/lib/utils";
import { useApp } from "@/src/contexts/app-context";
import { Spinner } from "@/src/components/ui/spinner";

export function RecuperacionForm() {
  const { addRecuperacionCinta, canAccess, recuperacionCintas } = useApp();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    finca: undefined as FincaName | undefined,
    semana: "",
    año: "2025",
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
      fecha: new Date().toISOString(),
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
      finca: undefined as FincaName | undefined,
      semana: "",
      año: "2025",
      colorCinta: "",
      enfundesIniciales: "",
      primeraCalCosecha: "",
      segundaCalCosecha: "",
      terceraCalCosecha: "",
      barridaFinal: "",
    });
    setErrors({});
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
              <Label htmlFor="finca">Finca</Label>
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
              <Label htmlFor="semana">Semana</Label>
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
              <Label htmlFor="colorCinta">Color de Cinta</Label>
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
                  <SelectItem value="Azul">Azul</SelectItem>
                  <SelectItem value="Rojo">Rojo</SelectItem>
                  <SelectItem value="Verde">Verde</SelectItem>
                  <SelectItem value="Amarillo">Amarillo</SelectItem>
                  <SelectItem value="Blanco">Blanco</SelectItem>
                  <SelectItem value="Naranja">Naranja</SelectItem>
                </SelectContent>
              </Select>
              {errors.colorCinta && (
                <p className="text-xs text-red-600">{errors.colorCinta}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="enfundesIniciales">Enfundes Iniciales</Label>
              <Input
                id="enfundesIniciales"
                type="number"
                min="0"
                value={formData.enfundesIniciales}
                onChange={(e) =>
                  (setFormData({
                    ...formData,
                    enfundesIniciales: e.target.value,
                  }), setErrors((prev) => ({ ...prev, enfundesIniciales: "" })))
                }
                disabled={isSubmitting}
                required
              />
              {errors.enfundesIniciales && (
                <p className="text-xs text-red-600">{errors.enfundesIniciales}</p>
              )}
            </div>
          </div>

          <div className="space-y-4 rounded-lg border border-border p-4">
            <h3 className="font-medium text-foreground">Calibraciones</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="primeraCalCosecha">
                  1ª Calibración - Cosecha
                </Label>
              <Input
                id="primeraCalCosecha"
                type="number"
                min="0"
                value={formData.primeraCalCosecha}
                onChange={(e) =>
                    (setFormData({
                      ...formData,
                      primeraCalCosecha: e.target.value,
                    }), setErrors((prev) => ({ ...prev, primeraCalCosecha: "" })))
                  }
                disabled={isSubmitting}
                required
              />
              {errors.primeraCalCosecha && (
                <p className="text-xs text-red-600">{errors.primeraCalCosecha}</p>
              )}
            </div>
              <div className="space-y-2">
                <Label>1ª Calibración - Saldo</Label>
                <Input value={primeraCalSaldo} disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="segundaCalCosecha">
                  2ª Calibración - Cosecha
                </Label>
              <Input
                id="segundaCalCosecha"
                type="number"
                min="0"
                value={formData.segundaCalCosecha}
                onChange={(e) =>
                    (setFormData({
                      ...formData,
                      segundaCalCosecha: e.target.value,
                    }), setErrors((prev) => ({ ...prev, segundaCalCosecha: "" })))
                  }
                disabled={isSubmitting}
                required
              />
              {errors.segundaCalCosecha && (
                <p className="text-xs text-red-600">{errors.segundaCalCosecha}</p>
              )}
            </div>
              <div className="space-y-2">
                <Label>2ª Calibración - Saldo</Label>
                <Input value={segundaCalSaldo} disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="terceraCalCosecha">
                  3ª Calibración - Cosecha
                </Label>
              <Input
                id="terceraCalCosecha"
                type="number"
                min="0"
                value={formData.terceraCalCosecha}
                onChange={(e) =>
                    (setFormData({
                      ...formData,
                      terceraCalCosecha: e.target.value,
                    }), setErrors((prev) => ({ ...prev, terceraCalCosecha: "" })))
                  }
                disabled={isSubmitting}
                required
              />
              {errors.terceraCalCosecha && (
                <p className="text-xs text-red-600">{errors.terceraCalCosecha}</p>
              )}
            </div>
              <div className="space-y-2">
                <Label>3ª Calibración - Saldo</Label>
                <Input value={terceraCalSaldo} disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="barridaFinal">Barrida Final</Label>
              <Input
                id="barridaFinal"
                type="number"
                min="0"
                value={formData.barridaFinal}
                onChange={(e) =>
                    (setFormData({ ...formData, barridaFinal: e.target.value }), setErrors((prev) => ({ ...prev, barridaFinal: "" })))
                  }
                disabled={isSubmitting}
                required
              />
              {errors.barridaFinal && (
                <p className="text-xs text-red-600">{errors.barridaFinal}</p>
              )}
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
