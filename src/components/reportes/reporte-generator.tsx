"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { FileText, Download } from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";
import type { FincaName } from "@/src/lib/types"; // Cambia Finca por FincaName

export function ReporteGenerator() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    tipo: "",
    finca: "" as FincaName | "todas", // Usa FincaName en lugar de Finca
    periodo: "",
    formato: "",
  });

  // Función helper para validar el tipo FincaName
  const isValidFinca = (value: string): value is FincaName => {
    return ["BABY", "SOLO", "LAURITA", "MARAVILLA"].includes(value);
  };

  // Manejar cambio de finca de forma segura
  const handleFincaChange = (value: string) => {
    if (value === "todas" || isValidFinca(value)) {
      setFormData({ ...formData, finca: value as FincaName | "todas" });
    } else {
      setFormData({ ...formData, finca: "" as FincaName | "todas" });
    }
  };

  const handleGenerate = () => {
    toast({
      title: "Generando reporte",
      description: `Reporte de ${formData.tipo} para ${formData.finca} - ${formData.periodo}`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Generador de Reportes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo de Reporte</Label>
          <Select
            value={formData.tipo}
            onValueChange={(value) => setFormData({ ...formData, tipo: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="produccion">Producción Completa</SelectItem>
              <SelectItem value="enfundes">Enfundes</SelectItem>
              <SelectItem value="cosechas">Cosechas</SelectItem>
              <SelectItem value="nomina">Nómina</SelectItem>
              <SelectItem value="inventario">Inventario</SelectItem>
              <SelectItem value="financiero">Financiero</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
              <SelectItem value="todas">Todas las Fincas</SelectItem>
              <SelectItem value="BABY">BABY</SelectItem>
              <SelectItem value="SOLO">SOLO</SelectItem>
              <SelectItem value="LAURITA">LAURITA</SelectItem>
              <SelectItem value="MARAVILLA">MARAVILLA</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="periodo">Período</Label>
          <Select
            value={formData.periodo}
            onValueChange={(value) =>
              setFormData({ ...formData, periodo: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoy">Hoy</SelectItem>
              <SelectItem value="semana">Esta Semana</SelectItem>
              <SelectItem value="mes">Este Mes</SelectItem>
              <SelectItem value="trimestre">Este Trimestre</SelectItem>
              <SelectItem value="año">Este Año</SelectItem>
              <SelectItem value="personalizado">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="formato">Formato</Label>
          <Select
            value={formData.formato}
            onValueChange={(value) =>
              setFormData({ ...formData, formato: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar formato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleGenerate}
          className="w-full gap-2"
          disabled={!formData.tipo || !formData.periodo}
        >
          <Download className="h-4 w-4" />
          Generar Reporte
        </Button>
      </CardContent>
    </Card>
  );
}
