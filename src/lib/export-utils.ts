// Lazy imports applied inside functions to reduce bundle size

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
export const exportToPDF = async ({
  title,
  headers,
  data,
  filename = 'reporte.pdf',
  orientation = 'portrait',
  pageSize = 'a4',
}: ExportToPDFOptions) => {
  const { default: jsPDF } = await import('jspdf');
  const autoTableModule = await import('jspdf-autotable');
  const autoTable = (autoTableModule as any).default || (autoTableModule as any).autoTable;
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: pageSize,
  });

  // Añadir título
  doc.setFontSize(18);
  doc.text(title, 14, 18);
  doc.setFontSize(11);
  doc.text(`Fecha: ${new Date().toLocaleString()}`, 14, 26);

  // Añadir tabla con estilos y paginación
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 32,
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
      halign: 'center',
    },
    bodyStyles: {
      valign: 'middle',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (dataArg: any) => {
      const pageNumber = doc.internal.getNumberOfPages();
      doc.setFontSize(10);
      doc.text(`Página ${dataArg.pageNumber} de ${pageNumber}`,
        doc.internal.pageSize.getWidth() - 14,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'right' }
      );
    },
  });

  // Guardar el archivo
  doc.save(filename);
};

/**
 * Exporta datos a un archivo Excel
 */
export const exportToExcel = async ({
  sheetName,
  headers,
  data,
  filename = 'reporte.xlsx',
}: ExportToExcelOptions) => {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();
  const excelData = [headers, ...data];
  const ws = XLSX.utils.aoa_to_sheet(excelData);

  // Auto filtro en encabezados
  const range = { s: { r: 0, c: 0 }, e: { r: data.length, c: headers.length - 1 } };
  (ws as any)['!autofilter'] = { ref: XLSX.utils.encode_range(range as any) };

  // Ajuste de ancho de columnas según contenido
  const colWidths = headers.map((h, i) => {
    const maxLen = Math.max(
      h.length,
      ...data.map(row => {
        const val = row[i];
        return val !== undefined && val !== null ? String(val).length : 0;
      })
    );
    return { wch: Math.min(Math.max(maxLen + 2, 12), 30) };
  });
  (ws as any)['!cols'] = colWidths;

  // Formato numérico en celdas (2 decimales) para números
  Object.keys(ws).forEach((cellKey) => {
    if (!cellKey.startsWith('!')) {
      const cell = (ws as any)[cellKey];
      if (cell && cell.t === 'n') {
        cell.z = '0.00';
      }
    }
  });

  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  await downloadBlob(blob, filename);
};

/**
 * Exporta datos a un archivo CSV
 */
export const exportToCSV = async ({
  headers,
  data,
  filename = 'reporte.csv',
  delimiter = ',',
}: ExportToCSVOptions) => {
  // Preparar los datos con encabezados
  const csvData = [headers, ...data];
  
  // Convertir a formato CSV con escape de comillas y saltos de línea
  const csvContent = csvData
    .map(row => row.map((cell) => {
      const value = cell === null || cell === undefined ? '' : String(cell);
      const escaped = value.replace(/"/g, '""');
      return value.includes(delimiter) || /[\n\r]/.test(value) || value.includes('"')
        ? `"${escaped}"`
        : escaped;
    }).join(delimiter))
    .join('\n');
  
  // Crear el blob y guardar el archivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  await downloadBlob(blob, filename);
};

/**
 * Función genérica para exportar datos en cualquier formato
 */
export const exportData = async (
  format: 'pdf' | 'excel' | 'csv',
  data: any[],
  headers: string[],
  title: string,
  filename?: string
) => {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const baseName = filename || `${title.toLowerCase().replace(/\s+/g, '-')}-${ts}`;

  switch (format) {
    case 'pdf': {
      const orientation = headers.length > 6 ? 'landscape' : 'portrait';
      await exportToPDF({
        title,
        headers,
        data,
        filename: `${baseName}.pdf`,
        orientation,
      });
      break;
    }
    case 'excel': {
      await exportToExcel({
        sheetName: title,
        headers,
        data,
        filename: `${baseName}.xlsx`,
      });
      break;
    }
    case 'csv': {
      await exportToCSV({
        headers,
        data,
        filename: `${baseName}.csv`,
      });
      break;
    }
    default:
      console.error('Formato de exportación no soportado');
  }
};

// Helper de descarga compatible con navegador y file-saver (declaración hoisted)
async function downloadBlob(blob: Blob, filename: string) {
  try {
    const mod = await import('file-saver');
    const saveAsFn = (mod as any).saveAs || (mod as any).default;
    if (typeof saveAsFn === 'function') {
      saveAsFn(blob, filename);
      return;
    }
  } catch (_) {
    // ignorar y usar fallback nativo
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}