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
      const pageNumber = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(10);
      doc.text(`Página ${dataArg.pageNumber} de ${pageNumber}`,
        (doc as any).internal.pageSize.getWidth() - 14,
        (doc as any).internal.pageSize.getHeight() - 10,
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
  const sanitizeSheetName = (name: string) => {
    const n = (name || 'Hoja').replace(/[\\\/?*\[\]:]/g, '').slice(0, 31);
    return n.length ? n : 'Hoja';
  };
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

  XLSX.utils.book_append_sheet(wb, ws, sanitizeSheetName(sheetName));
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
    .map(row => (row as unknown[]).map((cell: unknown) => {
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

export const exportProduccionPDFInstitucional = async (opts: {
  finca: string;
  año: number;
  productor?: string;
  variedad?: string;
  superficie?: number;
  cosechas: Array<{ semana: number; año: number; finca: string; racimosCorta: number; racimosRechazados: number; racimosRecuperados: number; cajasProducidas: number; pesoPromedio: number; calibracion: number; numeroManos: number; ratio: number; merma: number; }>
  filename?: string;
}) => {
  const { default: jsPDF } = await import('jspdf');
  const autoTableModule = await import('jspdf-autotable');
  const autoTable = (autoTableModule as any).default || (autoTableModule as any).autoTable;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const hoy = new Date();
  const fechaEmision = hoy.toLocaleDateString();
  const productor = opts.productor || '';
  const variedad = opts.variedad || '';
  const superficie = opts.superficie !== undefined ? `${opts.superficie}` : '';

  doc.setFontSize(16);
  doc.text('REPORTE DE PRODUCCION', 105, 15, { align: 'center' });
  doc.setFontSize(10);

  doc.text(`Fecha de emisión: ${fechaEmision}`, 14, 25);
  doc.text(`Fecha de revisión:`, 120, 25);
  doc.text(`PRODUCTOR: ${productor}`, 14, 32);
  doc.text(`CULTIVO: BANANO`, 120, 32);
  doc.text(`FINCA: ${opts.finca}`, 14, 39);
  doc.text(`VARIEDAD: ${variedad}`, 120, 39);
  doc.text(`UBICACIÓN:`, 14, 46);
  doc.text(`SUPERFICIE: ${superficie}`, 120, 46);
  doc.text(`AÑO: ${opts.año}`, 14, 53);

  const rows = opts.cosechas
    .filter(c => c.finca === opts.finca && c.año === opts.año)
    .sort((a, b) => a.semana - b.semana)
    .map(c => [
      c.semana,
      c.cajasProducidas,
      c.racimosCorta,
      c.racimosRechazados,
      c.racimosRecuperados,
      Number(c.ratio.toFixed(2)),
      Number(c.merma.toFixed(2)),
      Number(c.pesoPromedio.toFixed(1)),
      c.calibracion,
      Number(c.numeroManos.toFixed(1)),
    ]);

  const totals = rows.reduce((acc, r) => {
    acc.cajas += Number(r[1]);
    acc.racCorta += Number(r[2]);
    acc.rechaz += Number(r[3]);
    acc.recup += Number(r[4]);
    acc.ratio += Number(r[5]);
    acc.merma += Number(r[6]);
    acc.peso += Number(r[7]);
    acc.calib += Number(r[8]);
    acc.manos += Number(r[9]);
    acc.count += 1;
    return acc;
  }, { cajas: 0, racCorta: 0, rechaz: 0, recup: 0, ratio: 0, merma: 0, peso: 0, calib: 0, manos: 0, count: 0 });

  const foot = [
    'TOTAL',
    totals.cajas,
    totals.racCorta,
    totals.rechaz,
    totals.recup,
    totals.count ? Number((totals.ratio / totals.count).toFixed(2)) : 0,
    totals.count ? Number((totals.merma / totals.count).toFixed(2)) : 0,
    totals.count ? Number((totals.peso / totals.count).toFixed(1)) : 0,
    totals.count ? Number((totals.calib / totals.count).toFixed(0)) : 0,
    totals.count ? Number((totals.manos / totals.count).toFixed(1)) : 0,
  ];

  autoTable(doc, {
    head: [[
      'SEM', 'CAJAS PRODUCIDAS', 'RACIMOS CORT.', 'RECHAZ.', 'RECUPER.', 'RATIO', 'MERMA', 'PESO', 'CALIBRACIÓN', 'NÚMERO MANOS'
    ]],
    body: rows,
    foot: [foot],
    startY: 58,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2, lineWidth: 0.1 },
    headStyles: { fillColor: [153, 204, 102], textColor: 0, fontStyle: 'bold', halign: 'center' },
    footStyles: { fillColor: [230, 230, 230], textColor: 0, fontStyle: 'bold' },
    margin: { left: 10, right: 10 },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 28 },
      2: { cellWidth: 26 },
      3: { cellWidth: 22 },
      4: { cellWidth: 24 },
      5: { cellWidth: 18 },
      6: { cellWidth: 18 },
      7: { cellWidth: 18 },
      8: { cellWidth: 22 },
      9: { cellWidth: 24 },
    },
    didDrawPage: (dataArg: any) => {
      const pageNumber = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(9);
      doc.text(`Página ${dataArg.pageNumber} de ${pageNumber}`,
        (doc as any).internal.pageSize.getWidth() - 10,
        (doc as any).internal.pageSize.getHeight() - 8,
        { align: 'right' }
      );
    },
  });

  doc.save(opts.filename || `reporte-produccion-${opts.finca}-${opts.año}.pdf`);
};

export const exportRolPagoPDFCatorcenal = async (opts: {
  productor?: string;
  finca: string;
  ubicacion?: string;
  semanaInicio: number;
  semanaFin: number;
  año: number;
  mes?: number;
  quincena?: number;
  superficie?: number;
  fechaRevision?: string;
  roles: Array<{
    empleado?: { nombre?: string; cedula?: string; labor?: string };
    diasLaborados?: number;
    sueldoBase?: number;
    cosecha?: number;
    tareasEspeciales?: number;
    totalIngresos?: number;
    prestamos?: number;
    multas?: number;
    totalEgresos?: number;
    netoAPagar?: number;
  }>;
  elaboradoPor?: string;
  revisadoPor?: string;
  filename?: string;
}) => {
  const { default: jsPDF } = await import('jspdf');
  const autoTableModule = await import('jspdf-autotable');
  const autoTable = (autoTableModule as any).default || (autoTableModule as any).autoTable;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const hoy = new Date();
  const fechaEmision = hoy.toLocaleDateString();

  doc.setFontSize(16);
  doc.text('ROL DE PAGO CATORCENAL', 148.5, 12, { align: 'center' });

  doc.setFontSize(9);
  doc.text(`Fecha de Emision: ${fechaEmision}`, 10, 18);
  doc.text(`Fecha de revision: ${opts.fechaRevision || fechaEmision}`, 160, 18);
  doc.text(`PRODUCTOR: ${opts.productor || ''}`, 10, 24);
  doc.text(`Cultivo: BANANO`, 160, 24);
  doc.text(`FINCA: ${opts.finca}`, 10, 30);
  doc.text(`Variedad`, 160, 30);
  doc.text(`UBICACIÓN: ${opts.ubicacion || ''}`, 10, 36);
  doc.text(`SUPERFICIE: ${opts.superficie !== undefined ? `${opts.superficie} HA` : ''}`, 160, 36);
  doc.text(`SEMANA ${opts.semanaInicio}-${opts.semanaFin}`, 148.5, 42, { align: 'center' });
  if (opts.mes) {
    const nombresMes = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const nombre = nombresMes[(opts.mes - 1) % 12];
    const qLabel = opts.quincena === 2 ? '2ª quincena' : '1ª quincena';
    doc.text(`MES: ${nombre} - ${qLabel}`, 10, 42);
  }
  const grouped: Record<string, {
    nombre: string;
    cedula: string;
    labor: string;
    dias: number;
    sueldo: number;
    cosecha: number;
    adicional: number;
    ingresos: number;
    prestamos: number;
    multas: number;
    egresos: number;
    neto: number;
  }> = {};

  opts.roles.forEach((r) => {
    const key = r.empleado?.cedula || r.empleado?.nombre || String(Math.random());
    const cur = grouped[key] || {
      nombre: r.empleado?.nombre || '',
      cedula: r.empleado?.cedula || '',
      labor: r.empleado?.labor || '',
      dias: 0,
      sueldo: 0,
      cosecha: 0,
      adicional: 0,
      ingresos: 0,
      prestamos: 0,
      multas: 0,
      egresos: 0,
      neto: 0,
    };
    cur.dias += Number(r.diasLaborados || 0);
    cur.sueldo += Number(r.sueldoBase || 0);
    cur.cosecha += Number(r.cosecha || 0);
    cur.adicional += Number(r.tareasEspeciales || 0);
    cur.ingresos += Number(r.totalIngresos || 0);
    cur.prestamos += Number(r.prestamos || 0);
    cur.multas += Number(r.multas || 0);
    cur.egresos += Number(r.totalEgresos || 0);
    cur.neto += Number(r.netoAPagar || 0);
    grouped[key] = cur;
  });

  const rows = Object.values(grouped).map((g, idx) => [
    idx + 1,
    g.nombre,
    g.cedula,
    g.labor,
    Number(g.dias),
    Number(g.sueldo.toFixed(2)),
    Number(g.cosecha.toFixed(2)),
    0,
    Number(g.adicional.toFixed(2)),
    Number(g.ingresos.toFixed(2)),
    Number(g.prestamos.toFixed(2)),
    Number(g.multas.toFixed(2)),
    Number(g.egresos.toFixed(2)),
    Number(g.neto.toFixed(2)),
  ]);

  const totals = rows.reduce(
    (acc, r) => {
      acc.dias += Number(r[4]);
      acc.sueldo += Number(r[5]);
      acc.cosecha += Number(r[6]);
      acc.calibrar += Number(r[7]);
      acc.adicional += Number(r[8]);
      acc.ingresos += Number(r[9]);
      acc.prestamos += Number(r[10]);
      acc.multas += Number(r[11]);
      acc.egresos += Number(r[12]);
      acc.neto += Number(r[13]);
      return acc;
    },
    { dias: 0, sueldo: 0, cosecha: 0, calibrar: 0, adicional: 0, ingresos: 0, prestamos: 0, multas: 0, egresos: 0, neto: 0 }
  );

  const head = [[
    'N°',
    'DETALLE',
    'CEDULA',
    'LABORES',
    'DIAS LAB.',
    'SUELDO',
    'COSECHA',
    'SACAR DISCO',
    'ADICIONAL',
    'TOTAL INGRESOS',
    'PRESTAMO',
    'MULTA',
    'TOTAL EGRESOS',
    'TOTAL A RECIBIR',
  ]];

  const foot = [[
    '',
    'TOTAL',
    '',
    '',
    totals.dias,
    Number(totals.sueldo.toFixed(2)),
    Number(totals.cosecha.toFixed(2)),
    Number(totals.calibrar.toFixed(2)),
    Number(totals.adicional.toFixed(2)),
    Number(totals.ingresos.toFixed(2)),
    Number(totals.prestamos.toFixed(2)),
    Number(totals.multas.toFixed(2)),
    Number(totals.egresos.toFixed(2)),
    Number(totals.neto.toFixed(2)),
  ]];

  autoTable(doc, {
    head,
    body: rows,
    foot,
    startY: 48,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.8, lineWidth: 0.1 },
    headStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold', halign: 'center' },
    footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
    margin: { left: 6, right: 6 },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 40 },
      2: { cellWidth: 24 },
      3: { cellWidth: 24 },
      4: { cellWidth: 16 },
      5: { cellWidth: 22 },
      6: { cellWidth: 22 },
      7: { cellWidth: 22 },
      8: { cellWidth: 22 },
      9: { cellWidth: 26 },
      10: { cellWidth: 22 },
      11: { cellWidth: 22 },
      12: { cellWidth: 26 },
      13: { cellWidth: 26 },
    },
  });

  const valorAPagar = Number(totals.neto.toFixed(2));
  const pageW = (doc as any).internal.pageSize.getWidth();
  doc.setFontSize(10);
  doc.setDrawColor(230, 150, 100);
  doc.setFillColor(230, 150, 100);
  doc.rect(pageW - 90, (doc as any).lastAutoTable.finalY + 8, 80, 10, 'F');
  doc.setTextColor(0);
  doc.text(`VALOR A PAGAR    $  ${valorAPagar.toFixed(2)}`, pageW - 86, (doc as any).lastAutoTable.finalY + 15);

  doc.setFontSize(9);
  doc.text(`ELABORADO POR : ${opts.elaboradoPor || ''}`, 10, (doc as any).lastAutoTable.finalY + 20);
  doc.text(`REVISADO POR : ${opts.revisadoPor || ''}`, pageW - 90, (doc as any).lastAutoTable.finalY + 20);

  const base = opts.mes ? `${opts.año}-${String(opts.mes).padStart(2,'0')}-${opts.quincena === 2 ? 'q2' : 'q1'}` : `sem${opts.semanaInicio}-${opts.semanaFin}-${opts.año}`;
  doc.save(opts.filename || `rol-pago-${opts.finca}-${base}.pdf`);
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