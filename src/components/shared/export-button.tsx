"use client";

import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, File } from "lucide-react";
import { exportData } from "@/src/lib/export-utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";
import { Calendar } from "@/src/components/ui/calendar";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { useState } from "react";

interface ExportButtonProps {
  onExportExcel?: () => void;
  onExportPDF?: () => void;
  onExportCSV?: () => void;
  data?: any[];
  headers?: string[];
  title?: string;
  filename?: string;
  keys?: string[]; // agregado: mapeo explícito de claves de objeto
  enableFilter?: boolean; // nuevo: habilitar selección de rango para exportar
  dateField?: string; // campo de fecha (YYYY-MM-DD)
  weekField?: string; // campo de semana (número)
  yearField?: string; // campo de año (número)
  disabled?: boolean;
}

export function ExportButton({
  onExportExcel,
  onExportPDF,
  onExportCSV,
  data,
  headers,
  title,
  filename,
  keys, // nuevo
  enableFilter,
  dateField,
  weekField,
  yearField,
  disabled,
}: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [filterMode, setFilterMode] = useState<"todo" | "fecha" | "semana">("todo");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [startWeek, setStartWeek] = useState<string>("");
  const [endWeek, setEndWeek] = useState<string>("");
  const [year, setYear] = useState<string>("");

  const resolveFilteredData = () => {
    if (!data) return [] as any[];
    if (!enableFilter || filterMode === "todo") return data;
    if (filterMode === "fecha" && dateField) {
      const fromTime = dateRange.from?.getTime();
      const toTime = dateRange.to?.getTime();
      return data.filter((item) => {
        const raw = item[dateField];
        if (!raw) return false;
        const t = new Date(raw).getTime();
        if (fromTime && t < fromTime) return false;
        if (toTime && t > toTime) return false;
        return true;
      });
    }
    if (filterMode === "semana" && weekField && yearField) {
      const s = startWeek ? Number(startWeek) : undefined;
      const e = endWeek ? Number(endWeek) : undefined;
      const y = year ? Number(year) : undefined;
      return data.filter((item) => {
        const wk = Number(item[weekField]);
        const yr = Number(item[yearField]);
        if (y !== undefined && yr !== y) return false;
        if (s !== undefined && wk < s) return false;
        if (e !== undefined && wk > e) return false;
        return true;
      });
    }
    return data;
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    if (data && headers && title) {
      // Preparar los datos para exportación (solo valores, sin objetos complejos)
      const source = resolveFilteredData();
      const exportableData = source.map(item => {
        if (Array.isArray(item)) {
          return item;
        }
        // Si es un objeto y hay `keys`, extraer en ese orden
        if (keys && keys.length) {
          return keys.map(k => {
            const value = item[k] !== undefined ? item[k] : '';
            return typeof value === 'object' ? JSON.stringify(value) : value;
          });
        }
        // Fallback: mapear usando los headers transformados
        return (headers || []).map(header => {
          const key = header.toLowerCase().replace(/\s+/g, '_');
          const value = item[key] !== undefined ? item[key] : '';
          return typeof value === 'object' ? JSON.stringify(value) : value;
        });
      });

      await exportData(format, exportableData, headers, title, filename);
    } else {
      // Usar los callbacks personalizados si no se proporcionan datos directamente
      if (format === 'excel' && onExportExcel) onExportExcel();
      if (format === 'pdf' && onExportPDF) onExportPDF();
      if (format === 'csv' && onExportCSV) onExportCSV();
    }
  };

  if (enableFilter) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2 bg-transparent" disabled={!!disabled}>
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar datos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de filtro</Label>
              <Select value={filterMode} onValueChange={(v) => setFilterMode(v as any)}>
                <SelectTrigger className="w-[220px]"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Exportar todo</SelectItem>
                  <SelectItem value="fecha">Por fecha</SelectItem>
                  <SelectItem value="semana">Por semanas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filterMode === "fecha" && (
              <div className="space-y-2">
                <Label>Rango de fechas</Label>
                <Calendar
                  mode="range"
                  selected={dateRange as any}
                  onSelect={(range: any) => setDateRange(range || {})}
                />
              </div>
            )}

            {filterMode === "semana" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Semana inicio</Label>
                  <Input value={startWeek} onChange={(e) => setStartWeek(e.target.value)} placeholder="1" />
                </div>
                <div className="space-y-2">
                  <Label>Semana fin</Label>
                  <Input value={endWeek} onChange={(e) => setEndWeek(e.target.value)} placeholder="52" />
                </div>
                <div className="space-y-2">
                  <Label>Año</Label>
                  <Input value={year} onChange={(e) => setYear(e.target.value)} placeholder="2025" />
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 justify-end">
              {(onExportExcel || (data && headers)) && (
                <Button onClick={() => handleExport('excel')} className="gap-2">
                  <FileSpreadsheet className="h-4 w-4" /> Excel
                </Button>
              )}
              {(onExportPDF || (data && headers)) && (
                <Button onClick={() => handleExport('pdf')} variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" /> PDF
                </Button>
              )}
              {(onExportCSV || (data && headers)) && (
                <Button onClick={() => handleExport('csv')} variant="outline" className="gap-2">
                  <File className="h-4 w-4" /> CSV
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent" disabled={!!disabled}>
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(onExportExcel || (data && headers)) && (
          <DropdownMenuItem onClick={() => handleExport('excel')}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Exportar a Excel
          </DropdownMenuItem>
        )}
        {(onExportPDF || (data && headers)) && (
          <DropdownMenuItem onClick={() => handleExport('pdf')}>
            <FileText className="mr-2 h-4 w-4" />
            Exportar a PDF
          </DropdownMenuItem>
        )}
        {(onExportCSV || (data && headers)) && (
          <DropdownMenuItem onClick={() => handleExport('csv')}>
            <File className="mr-2 h-4 w-4" />
            Exportar a CSV
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
