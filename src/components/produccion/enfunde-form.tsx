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
import type { Enfunde, FincaName } from "@/src/lib/types"; // Cambia Finca por FincaName
import { Plus } from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";

export function EnfundeForm() {
  const { addEnfunde } = useApp();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    finca: "" as FincaName | "", // Usa FincaName en lugar de Finca
    semana: "",
    año: "2025",
    colorCinta: "",
    cantidadEnfundes: "",
    matasCaidas: "",
    fecha: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que finca sea un valor válido de FincaName
    if (!formData.finca || !isValidFinca(formData.finca)) {
      toast({
        title: "Error",
        description: "Por favor selecciona una finca válida",
        variant: "destructive",
      });
      return;
    }

    const newEnfunde: Enfunde = {
      id: Date.now().toString(),
      finca: formData.finca, // Ya está tipado como FincaName
      semana: Number.parseInt(formData.semana),
      año: Number.parseInt(formData.año),
      colorCinta: formData.colorCinta,
      cantidadEnfundes: Number.parseInt(formData.cantidadEnfundes),
      matasCaidas: Number.parseInt(formData.matasCaidas),
      fecha: formData.fecha,
    };

    addEnfunde(newEnfunde);
    toast({
      title: "Enfunde registrado",
      description: `Se registraron ${formData.cantidadEnfundes} enfundes en ${formData.finca}`,
    });

    // Reset form
    setFormData({
      finca: "" as FincaName | "", // Reset a string vacío
      semana: "",
      año: "2025",
      colorCinta: "",
      cantidadEnfundes: "",
      matasCaidas: "",
      fecha: new Date().toISOString().split("T")[0],
    });
  };

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Enfunde</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
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
              <Label htmlFor="semana">Semana (1-52)</Label>
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
              <Label htmlFor="colorCinta">Color de Cinta</Label>
              <Select
                value={formData.colorCinta}
                onValueChange={(value) =>
                  setFormData({ ...formData, colorCinta: value })
                }
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="cantidadEnfundes">Cantidad de Enfundes</Label>
              <Input
                id="cantidadEnfundes"
                type="number"
                min="0"
                value={formData.cantidadEnfundes}
                onChange={(e) =>
                  setFormData({ ...formData, cantidadEnfundes: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="matasCaidas">Matas Caídas</Label>
              <Input
                id="matasCaidas"
                type="number"
                min="0"
                value={formData.matasCaidas}
                onChange={(e) =>
                  setFormData({ ...formData, matasCaidas: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha de Ejecución</Label>
              <Input
                id="fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) =>
                  setFormData({ ...formData, fecha: e.target.value })
                }
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Registrar Enfunde
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
