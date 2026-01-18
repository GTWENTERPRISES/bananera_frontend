/**
 * Tests para lógica del Dashboard
 */

// Mock data
const mockCosechas = [
  { id: '1', finca: 'BABY', semana: 1, año: 2025, cajasProducidas: 1000, racimosCorta: 500, ratio: 2.0, merma: 5, pesoPromedio: 42, calibracion: 46, numeroManos: 9, racimosRechazados: 10, racimosRecuperados: 5 },
  { id: '2', finca: 'SOLO', semana: 1, año: 2025, cajasProducidas: 800, racimosCorta: 400, ratio: 2.0, merma: 4, pesoPromedio: 43, calibracion: 47, numeroManos: 10, racimosRechazados: 8, racimosRecuperados: 3 },
];

const mockEnfundes = [
  { id: '1', finca: 'BABY', semana: 1, año: 2025, cantidadEnfundes: 500, matasCaidas: 10, colorCinta: 'azul', fecha: '2025-01-01' },
  { id: '2', finca: 'SOLO', semana: 1, año: 2025, cantidadEnfundes: 400, matasCaidas: 8, colorCinta: 'rojo', fecha: '2025-01-01' },
];

describe('Dashboard Data Calculations', () => {
  it('should calculate total production correctly', () => {
    const totalProduccion = mockCosechas.reduce(
      (sum, c) => sum + (c.cajasProducidas || 0),
      0
    );
    expect(totalProduccion).toBe(1800);
  });

  it('should calculate total enfundes correctly', () => {
    const totalEnfundes = mockEnfundes.reduce(
      (sum, e) => sum + (e.cantidadEnfundes || 0),
      0
    );
    expect(totalEnfundes).toBe(900);
  });

  it('should calculate average ratio correctly', () => {
    const avgRatio = mockCosechas.reduce(
      (sum, c) => sum + (c.ratio || 0),
      0
    ) / mockCosechas.length;
    expect(avgRatio).toBe(2.0);
  });

  it('should calculate total matas caidas correctly', () => {
    const totalMatasCaidas = mockEnfundes.reduce(
      (sum, e) => sum + (e.matasCaidas || 0),
      0
    );
    expect(totalMatasCaidas).toBe(18);
  });

  it('should filter cosechas by finca', () => {
    const cosechasBaby = mockCosechas.filter(c => c.finca === 'BABY');
    expect(cosechasBaby).toHaveLength(1);
    expect(cosechasBaby[0].cajasProducidas).toBe(1000);
  });
});

describe('Dashboard Quality Metrics', () => {
  it('should calculate average peso promedio', () => {
    const avgPeso = mockCosechas.reduce(
      (sum, c) => sum + (c.pesoPromedio || 0),
      0
    ) / mockCosechas.length;
    expect(avgPeso).toBe(42.5);
  });

  it('should calculate average calibracion', () => {
    const avgCalibracion = mockCosechas.reduce(
      (sum, c) => sum + (c.calibracion || 0),
      0
    ) / mockCosechas.length;
    expect(avgCalibracion).toBe(46.5);
  });

  it('should calculate average numero manos', () => {
    const avgManos = mockCosechas.reduce(
      (sum, c) => sum + (c.numeroManos || 0),
      0
    ) / mockCosechas.length;
    expect(avgManos).toBe(9.5);
  });
});

describe('Dashboard Heatmap Data', () => {
  it('should organize data by finca', () => {
    const dataByFinca: Record<string, number> = {};
    
    mockEnfundes.forEach(e => {
      dataByFinca[e.finca] = (dataByFinca[e.finca] || 0) + e.cantidadEnfundes;
    });

    expect(dataByFinca['BABY']).toBe(500);
    expect(dataByFinca['SOLO']).toBe(400);
  });

  it('should calculate productivity percentage', () => {
    const target = 600;
    const actual = 500;
    const percentage = Math.round((actual / target) * 100);
    
    expect(percentage).toBe(83);
  });

  it('should determine color class based on percentage', () => {
    const getColorClass = (value: number) => {
      if (value === 0) return 'bg-gray-300';
      if (value >= 75) return 'bg-green-600';
      if (value >= 50) return 'bg-green-500';
      if (value >= 25) return 'bg-yellow-500';
      if (value >= 10) return 'bg-orange-500';
      return 'bg-red-500';
    };

    expect(getColorClass(0)).toBe('bg-gray-300');
    expect(getColorClass(80)).toBe('bg-green-600');
    expect(getColorClass(60)).toBe('bg-green-500');
    expect(getColorClass(30)).toBe('bg-yellow-500');
    expect(getColorClass(15)).toBe('bg-orange-500');
    expect(getColorClass(5)).toBe('bg-red-500');
  });
});

describe('Weekly Summary Calculations', () => {
  it('should calculate weekly stats correctly', () => {
    const stats = {
      totalEnfundes: mockEnfundes.reduce((sum, e) => sum + (e.cantidadEnfundes || 0), 0),
      totalCosecha: mockCosechas.reduce((sum, c) => sum + (c.cajasProducidas || 0), 0),
      avgRatio: mockCosechas.length > 0
        ? mockCosechas.reduce((sum, c) => sum + (c.ratio || 0), 0) / mockCosechas.length
        : 0,
      totalMatasCaidas: mockEnfundes.reduce((sum, e) => sum + (e.matasCaidas || 0), 0),
    };

    expect(stats.totalEnfundes).toBe(900);
    expect(stats.totalCosecha).toBe(1800);
    expect(stats.avgRatio).toBe(2.0);
    expect(stats.totalMatasCaidas).toBe(18);
  });
});

describe('KPI Card Display Values', () => {
  it('should format production value correctly', () => {
    const totalProduccion = 1800;
    const formatted = `${totalProduccion.toLocaleString('en-US')} cajas`;
    expect(formatted).toBe('1,800 cajas');
  });

  it('should format currency correctly', () => {
    const nominaPendiente = 5432.50;
    const formatted = `$${nominaPendiente.toLocaleString("en-US", {
      minimumFractionDigits: 2,
    })}`;
    expect(formatted).toBe('$5,432.50');
  });

  it('should calculate change percentage', () => {
    const previous = 1000;
    const current = 1052;
    const change = ((current - previous) / previous) * 100;
    expect(change).toBeCloseTo(5.2, 0);
  });
});
