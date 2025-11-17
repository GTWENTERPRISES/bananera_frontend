"use client";

import { useMemo, useState } from "react";
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
import { useApp } from "@/src/contexts/app-context";
import { exportData } from "@/src/lib/export-utils";

export function ReporteGenerator() {
  const { toast } = useToast();
  const { enfundes, cosechas, rolesPago, movimientosInventario, insumos } = useApp();
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

  const rangoFechas = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);
    switch (formData.periodo) {
      case "hoy":
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "semana": {
        const day = now.getDay();
        const diff = (day === 0 ? -6 : 1) - day;
        start.setDate(now.getDate() + diff);
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      }
      case "mes":
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(start.getMonth() + 1);
        end.setDate(0);
        end.setHours(23, 59, 59, 999);
        break;
      case "trimestre": {
        const q = Math.floor(now.getMonth() / 3) * 3;
        start.setMonth(q, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(q + 3, 0);
        end.setHours(23, 59, 59, 999);
        break;
      }
      case "año":
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(12, 0);
        end.setHours(23, 59, 59, 999);
        break;
      default:
        start.setFullYear(2000, 0, 1);
        start.setHours(0, 0, 0, 0);
        end.setFullYear(2100, 11, 31);
        end.setHours(23, 59, 59, 999);
    }
    return { start, end };
  }, [formData.periodo]);

  const filtrarPorFinca = <T extends { finca?: string }>(arr: T[]) => {
    if (formData.finca && formData.finca !== "todas") {
      return arr.filter((x) => x.finca === formData.finca);
    }
    return arr;
  };

  const handleGenerate = async () => {
    if (!formData.tipo || !formData.formato || !formData.periodo) {
      toast({ title: "Completa los campos", description: "Selecciona tipo, período y formato" });
      return;
    }

    const fmt = formData.formato as "pdf" | "excel" | "csv";
    let data: any[] = [];
    let headers: string[] = [];
    let keys: string[] = [];
    let title = "Reporte";
    let filename = "reporte";

    if (formData.tipo === "enfundes") {
      const items = filtrarPorFinca(enfundes).filter((e) => {
        const d = new Date(e.fecha);
        return d >= rangoFechas.start && d <= rangoFechas.end;
      });
      data = items.map((e) => ({
        fecha: e.fecha,
        finca: e.finca,
        semana: e.semana,
        año: e.año,
        colorCinta: e.colorCinta,
        cantidadEnfundes: e.cantidadEnfundes,
        matasCaidas: e.matasCaidas,
      }));
      headers = ["Fecha", "Finca", "Semana", "Año", "Color", "Enfundes", "Matas Caídas"];
      keys = ["fecha", "finca", "semana", "año", "colorCinta", "cantidadEnfundes", "matasCaidas"];
      title = "Reporte de Enfundes";
      filename = "reporte-enfundes";
    } else if (formData.tipo === "cosechas" || formData.tipo === "produccion") {
      const items = filtrarPorFinca(cosechas).filter(() => true);
      data = items.map((c) => ({
        semana: c.semana,
        año: c.año,
        finca: c.finca,
        racimosCorta: c.racimosCorta,
        racimosRechazados: c.racimosRechazados,
        racimosRecuperados: c.racimosRecuperados,
        cajasProducidas: c.cajasProducidas,
        pesoPromedio: c.pesoPromedio,
        calibracion: c.calibracion,
        numeroManos: c.numeroManos,
        ratio: c.ratio,
        merma: c.merma,
      }));
      headers = ["Semana", "Año", "Finca", "Racimos Cortados", "Rechazados", "Recuperados", "Cajas", "Peso Prom.", "Calibración", "Manos", "Ratio", "Merma"];
      keys = ["semana", "año", "finca", "racimosCorta", "racimosRechazados", "racimosRecuperados", "cajasProducidas", "pesoPromedio", "calibracion", "numeroManos", "ratio", "merma"];
      title = formData.tipo === "cosechas" ? "Reporte de Cosechas" : "Producción Completa";
      filename = formData.tipo === "cosechas" ? "reporte-cosechas" : "reporte-produccion";
    } else if (formData.tipo === "nomina") {
      const items = rolesPago;
      data = items.map((r) => ({
        empleado: r.empleado?.nombre || "N/A",
        finca: r.finca,
        semana: r.semana,
        año: r.año,
        ingresos: r.totalIngresos || 0,
        egresos: r.totalEgresos || 0,
        neto: r.netoAPagar || 0,
        estado: r.estado,
      }));
      headers = ["Empleado", "Finca", "Semana", "Año", "Ingresos", "Egresos", "Neto", "Estado"];
      keys = ["empleado", "finca", "semana", "año", "ingresos", "egresos", "neto", "estado"];
      title = "Reporte de Nómina";
      filename = "reporte-nomina";
    } else if (formData.tipo === "inventario") {
      const items = movimientosInventario.filter((m) => {
        const d = new Date(m.fecha);
        return d >= rangoFechas.start && d <= rangoFechas.end;
      });
      data = items.map((m) => ({
        fecha: m.fecha,
        insumo: insumos.find((i) => i.id === m.insumoId)?.nombre || "N/A",
        tipo: m.tipo === "entrada" ? "Entrada" : "Salida",
        cantidad: m.cantidad,
        responsable: m.responsable,
        motivo: m.motivo,
      }));
      headers = ["Fecha", "Insumo", "Tipo", "Cantidad", "Responsable", "Motivo"];
      keys = ["fecha", "insumo", "tipo", "cantidad", "responsable", "motivo"];
      title = "Reporte de Inventario";
      filename = "reporte-inventario";
    } else if (formData.tipo === "financiero") {
      const items = rolesPago;
      data = items.map((r) => ({
        empleado: r.empleado?.nombre || "N/A",
        finca: r.finca,
        semana: r.semana,
        año: r.año,
        netoAPagar: r.netoAPagar || 0,
      }));
      headers = ["Empleado", "Finca", "Semana", "Año", "Neto a Pagar"];
      keys = ["empleado", "finca", "semana", "año", "netoAPagar"];
      title = "Reporte Financiero";
      filename = "reporte-financiero";
    }

    try {
      const prepared = data.map((item) => keys.map((k) => item[k]));
      await exportData(fmt, prepared, headers, title, filename);
      toast({ title: "Reporte generado", description: `${title} en ${formData.formato.toUpperCase()}` });
    } catch (e) {
      toast({ title: "Error al exportar", description: "Intenta nuevamente" });
    }
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
