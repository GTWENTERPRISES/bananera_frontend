import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Tipo para la función de exportación a PDF
interface ExportToPDFOptions {
  title: string;
  headers: string[];
  data: any[];
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  pageSize?: string;
}

// Tipo para la función de exportación a Excel
interface ExportToExcelOptions {
  sheetName: string;
  headers: string[];
  data: any[];
  filename?: string;
}

// Tipo para la función de exportación a CSV
interface ExportToCSVOptions {
  headers: string[];
  data: any[];
  filename?: string;
  delimiter?: string;
}

/**
 * Exporta datos a un archivo PDF
 */
export const exportToPDF = ({
  title,
  headers,
  data,
  filename = 'reporte.pdf',
  orientation = 'portrait',
  pageSize = 'a4',
}: ExportToPDFOptions) => {
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: pageSize,
  });

  // Añadir título
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 30);

  // Añadir tabla
  (doc as any).autoTable({
    head: [headers],
    body: data,
    startY: 40,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 3,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  // Guardar el archivo
  doc.save(filename);
};

/**
 * Exporta datos a un archivo Excel
 */
export const exportToExcel = ({
  sheetName,
  headers,
  data,
  filename = 'reporte.xlsx',
}: ExportToExcelOptions) => {
  // Crear un libro de trabajo
  const wb = XLSX.utils.book_new();
  
  // Preparar los datos con encabezados
  const excelData = [headers, ...data];
  
  // Crear una hoja de trabajo
  const ws = XLSX.utils.aoa_to_sheet(excelData);
  
  // Añadir la hoja al libro
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  // Generar el archivo y guardarlo
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, filename);
};

/**
 * Exporta datos a un archivo CSV
 */
export const exportToCSV = ({
  headers,
  data,
  filename = 'reporte.csv',
  delimiter = ',',
}: ExportToCSVOptions) => {
  // Preparar los datos con encabezados
  const csvData = [headers, ...data];
  
  // Convertir a formato CSV
  const csvContent = csvData
    .map(row => row.join(delimiter))
    .join('\n');
  
  // Crear el blob y guardar el archivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, filename);
};

/**
 * Función genérica para exportar datos en cualquier formato
 */
export const exportData = (
  format: 'pdf' | 'excel' | 'csv',
  data: any[],
  headers: string[],
  title: string,
  filename?: string
) => {
  switch (format) {
    case 'pdf':
      exportToPDF({
        title,
        headers,
        data,
        filename: filename || `${title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
      });
      break;
    case 'excel':
      exportToExcel({
        sheetName: title,
        headers,
        data,
        filename: filename || `${title.toLowerCase().replace(/\s+/g, '-')}.xlsx`,
      });
      break;
    case 'csv':
      exportToCSV({
        headers,
        data,
        filename: filename || `${title.toLowerCase().replace(/\s+/g, '-')}.csv`,
      });
      break;
    default:
      console.error('Formato de exportación no soportado');
  }
};