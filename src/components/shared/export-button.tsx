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

interface ExportButtonProps {
  onExportExcel?: () => void;
  onExportPDF?: () => void;
  onExportCSV?: () => void;
  data?: any[];
  headers?: string[];
  title?: string;
  filename?: string;
}

export function ExportButton({
  onExportExcel,
  onExportPDF,
  onExportCSV,
  data,
  headers,
  title,
  filename,
}: ExportButtonProps) {
  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    if (data && headers && title) {
      // Preparar los datos para exportación (solo valores, sin objetos complejos)
      const exportableData = data.map(item => {
        if (Array.isArray(item)) {
          return item;
        }
        // Si es un objeto, extraer los valores en el mismo orden que los headers
        return headers.map(header => {
          const key = header.toLowerCase().replace(/\s+/g, '_');
          const value = item[key] !== undefined ? item[key] : '';
          return typeof value === 'object' ? JSON.stringify(value) : value;
        });
      });

      exportData(format, exportableData, headers, title, filename);
    } else {
      // Usar los callbacks personalizados si no se proporcionan datos directamente
      if (format === 'excel' && onExportExcel) onExportExcel();
      if (format === 'pdf' && onExportPDF) onExportPDF();
      if (format === 'csv' && onExportCSV) onExportCSV();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
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
