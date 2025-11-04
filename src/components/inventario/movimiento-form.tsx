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
import type { MovimientoInventario, FincaName } from "@/src/lib/types"; // Cambia Finca por FincaName
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";

export function MovimientoForm() {
  const { addMovimientoInventario, insumos } = useApp(); // Removí updateInsumoStock
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    insumoId: "",
    tipo: "" as "entrada" | "salida",
    cantidad: "",
    finca: "" as FincaName | "", // Usa FincaName en lugar de Finca
    motivo: "",
    responsable: "",
  });

  const insumo = insumos.find((i) => i.id === formData.insumoId);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que finca sea un valor válido
    if (!formData.finca || !isValidFinca(formData.finca)) {
      toast({
        title: "Error",
        description: "Por favor selecciona una finca válida",
        variant: "destructive",
      });
      return;
    }

    if (!insumo) {
      toast({
        title: "Error",
        description: "Por favor selecciona un insumo válido",
        variant: "destructive",
      });
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
      cantidad,
      fecha: new Date().toISOString().split("T")[0], // Formato YYYY-MM-DD
      motivo: formData.motivo,
      responsable: formData.responsable,
    };

    addMovimientoInventario(newMovimiento);

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
              <Label htmlFor="insumo">Insumo</Label>
              <Select
                value={formData.insumoId}
                onValueChange={(value) =>
                  setFormData({ ...formData, insumoId: value })
                }
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Movimiento</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    tipo: value as "entrada" | "salida",
                  })
                }
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad</Label>
              <Input
                id="cantidad"
                type="number"
                step="0.01"
                min="0"
                value={formData.cantidad}
                onChange={(e) =>
                  setFormData({ ...formData, cantidad: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsable">Responsable</Label>
              <Input
                id="responsable"
                value={formData.responsable}
                onChange={(e) =>
                  setFormData({ ...formData, responsable: e.target.value })
                }
                required
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="motivo">Motivo</Label>
              <Input
                id="motivo"
                value={formData.motivo}
                onChange={(e) =>
                  setFormData({ ...formData, motivo: e.target.value })
                }
                placeholder="Ej: Aplicación semanal, compra, etc."
                required
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
              !insumo ||
              !formData.tipo ||
              !formData.cantidad ||
              !formData.responsable ||
              !formData.motivo
            }
          >
            {formData.tipo === "entrada" ? (
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
