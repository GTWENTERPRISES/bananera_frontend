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

export function CosechaForm() {
  const { addCosecha, cosechas } = useApp();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    finca: undefined as FincaName | undefined,
    semana: "",
    año: "2025",
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

    const newCosecha: Cosecha = {
      id: Date.now().toString(),
      finca: formData.finca as FincaName,
      semana: Number.parseInt(formData.semana),
      año: Number.parseInt(formData.año),
      fecha: new Date().toISOString(),
      racimosCorta: Number.parseInt(formData.racimosCorta), // Cambiado a racimosCorta
      racimosRechazados: Number.parseInt(formData.racimosRechazados),
      racimosRecuperados,
      cajasProducidas: Number.parseInt(formData.cajasProducidas),
      pesoPromedio: Number.parseFloat(formData.pesoPromedio),
      calibracion: Number.parseInt(formData.calibracion),
      numeroManos: Number.parseFloat(formData.numeroManos),
      ratio: Number.parseFloat(ratio.toFixed(2)),
      merma: Number.parseFloat(merma.toFixed(2)),
    };

    const dup = false;
    if (false) {
      toast({ title: "Registro duplicado", description: "Ya existe una cosecha para esa finca/semana/año", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    addCosecha(newCosecha);
    toast({
      title: "Cosecha registrada",
      description: `Ratio: ${ratio.toFixed(2)} | Merma: ${merma.toFixed(2)}%`,
    });

    // Reset form
    setFormData({
      finca: undefined as FincaName | undefined,
      semana: "",
      año: "2025",
      racimosCorta: "", // Cambiado a racimosCorta
      racimosRechazados: "",
      cajasProducidas: "",
      pesoPromedio: "",
      calibracion: "",
      numeroManos: "",
    });
    setErrors({});
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
              <Label htmlFor="racimosCorta">Racimos Cortados</Label>{" "}
              {/* Cambiado el label también */}
              <Input
                id="racimosCorta"
                type="number"
                min="0"
                value={formData.racimosCorta}
                onChange={
                  (e) =>
                    (setFormData({ ...formData, racimosCorta: e.target.value }), setErrors((prev) => ({ ...prev, racimosCorta: "" })))
                }
                disabled={isSubmitting}
                required
              />
              {errors.racimosCorta && (
                <p className="text-xs text-red-600">{errors.racimosCorta}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="racimosRechazados">Racimos Rechazados</Label>
              <Input
                id="racimosRechazados"
                type="number"
                min="0"
                value={formData.racimosRechazados}
                onChange={(e) =>
                  (setFormData({
                    ...formData,
                    racimosRechazados: e.target.value,
                  }), setErrors((prev) => ({ ...prev, racimosRechazados: "" })))
                }
                disabled={isSubmitting}
                required
              />
              {errors.racimosRechazados && (
                <p className="text-xs text-red-600">{errors.racimosRechazados}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cajasProducidas">Cajas Producidas</Label>
              <Input
                id="cajasProducidas"
                type="number"
                min="0"
                value={formData.cajasProducidas}
                onChange={(e) =>
                  (setFormData({ ...formData, cajasProducidas: e.target.value }), setErrors((prev) => ({ ...prev, cajasProducidas: "" })))
                }
                disabled={isSubmitting}
                required
              />
              {errors.cajasProducidas && (
                <p className="text-xs text-red-600">{errors.cajasProducidas}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pesoPromedio">Peso Promedio (lb)</Label>
              <Input
                id="pesoPromedio"
                type="number"
                step="0.1"
                min="0"
                value={formData.pesoPromedio}
                onChange={(e) =>
                  (setFormData({ ...formData, pesoPromedio: e.target.value }), setErrors((prev) => ({ ...prev, pesoPromedio: "" })))
                }
                disabled={isSubmitting}
                required
              />
              {errors.pesoPromedio && (
                <p className="text-xs text-red-600">{errors.pesoPromedio}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="calibracion">Calibración</Label>
              <Input
                id="calibracion"
                type="number"
                min="0"
                value={formData.calibracion}
                onChange={(e) =>
                  (setFormData({ ...formData, calibracion: e.target.value }), setErrors((prev) => ({ ...prev, calibracion: "" })))
                }
                disabled={isSubmitting}
                required
              />
              {errors.calibracion && (
                <p className="text-xs text-red-600">{errors.calibracion}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="numeroManos">Número de Manos</Label>
              <Input
                id="numeroManos"
                type="number"
                step="0.1"
                min="0"
                value={formData.numeroManos}
                onChange={(e) =>
                  (setFormData({ ...formData, numeroManos: e.target.value }), setErrors((prev) => ({ ...prev, numeroManos: "" })))
                }
                disabled={isSubmitting}
                required
              />
              {errors.numeroManos && (
                <p className="text-xs text-red-600">{errors.numeroManos}</p>
              )}
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
