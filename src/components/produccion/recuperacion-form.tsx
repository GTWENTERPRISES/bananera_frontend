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
import { cn } from "@/src/lib/utils";
import { useApp } from "@/src/contexts/app-context";

export function RecuperacionForm() {
  const { addRecuperacionCinta, canAccess } = useApp();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    finca: "" as FincaName | "", // Usa FincaName en lugar de Finca
    semana: "",
    año: "2025",
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
      setFormData({ ...formData, finca: "" as FincaName | "" });
    }
  };

  const allowEdit = canAccess("produccion", "edit");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!allowEdit) {
      toast({ title: "Permiso requerido", description: "Tu rol no puede registrar recuperación", variant: "destructive" });
      return;
    }

    // Validar que finca sea un valor válido
    if (!formData.finca || !isValidFinca(formData.finca)) {
      toast({
        title: "Error",
        description: "Por favor selecciona una finca válida",
        variant: "destructive",
      });
      return;
    }

    // Crear el objeto de recuperación
    const newRecuperacion: RecuperacionCinta = {
      id: Date.now().toString(),
      finca: formData.finca,
      semana: Number.parseInt(formData.semana),
      año: Number.parseInt(formData.año),
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

    // Agregar al contexto (necesitarás agregar esta función a tu app-context)
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
      finca: "" as FincaName | "",
      semana: "",
      año: "2025",
      enfundesIniciales: "",
      primeraCalCosecha: "",
      segundaCalCosecha: "",
      terceraCalCosecha: "",
      barridaFinal: "",
    });
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
              <Label htmlFor="semana">Semana</Label>
              <Input
                id="semana"
                type="number"
                min="1"
                max="52"
                value={formData.semana}
                onChange={(e) =>
                  setFormData({ ...formData, semana: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="enfundesIniciales">Enfundes Iniciales</Label>
              <Input
                id="enfundesIniciales"
                type="number"
                min="0"
                value={formData.enfundesIniciales}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    enfundesIniciales: e.target.value,
                  })
                }
                required
              />
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
                    setFormData({
                      ...formData,
                      primeraCalCosecha: e.target.value,
                    })
                  }
                  required
                />
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
                    setFormData({
                      ...formData,
                      segundaCalCosecha: e.target.value,
                    })
                  }
                  required
                />
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
                    setFormData({
                      ...formData,
                      terceraCalCosecha: e.target.value,
                    })
                  }
                  required
                />
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
                    setFormData({ ...formData, barridaFinal: e.target.value })
                  }
                  required
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

          <Button type="submit" className="w-full gap-2" disabled={!allowEdit}>
            <Calculator className="h-4 w-4" />
            Registrar Recuperación
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
