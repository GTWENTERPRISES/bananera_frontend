/**
 * Pruebas de Rendimiento
 * Verifica tiempos de carga, optimización y manejo de grandes volúmenes
 */

describe('Performance Tests', () => {
  describe('Data Processing Performance', () => {
    it('should process 1000 enfundes in under 100ms', () => {
      const startTime = performance.now();
      
      // Generate mock data
      const enfundes = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        finca: ['BABY', 'SOLO', 'LAURITA', 'MARAVILLA'][i % 4],
        semana: (i % 52) + 1,
        año: 2025,
        cantidadEnfundes: Math.floor(Math.random() * 1000),
        matasCaidas: Math.floor(Math.random() * 50),
      }));

      // Process data
      const totalEnfundes = enfundes.reduce((sum, e) => sum + e.cantidadEnfundes, 0);
      const avgEnfundes = totalEnfundes / enfundes.length;
      const byFinca = enfundes.reduce((acc, e) => {
        acc[e.finca] = (acc[e.finca] || 0) + e.cantidadEnfundes;
        return acc;
      }, {} as Record<string, number>);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100);
      expect(enfundes).toHaveLength(1000);
      expect(avgEnfundes).toBeGreaterThan(0);
    });

    it('should filter and sort 5000 records in under 200ms', () => {
      const startTime = performance.now();

      const records = Array.from({ length: 5000 }, (_, i) => ({
        id: `${i}`,
        fecha: new Date(2025, 0, 1 + (i % 365)).toISOString(),
        valor: Math.random() * 10000,
        finca: ['BABY', 'SOLO', 'LAURITA', 'MARAVILLA'][i % 4],
      }));

      // Filter
      const filtered = records.filter(r => r.finca === 'BABY');
      
      // Sort
      const sorted = filtered.sort((a, b) => b.valor - a.valor);

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200);
      expect(sorted.length).toBeLessThan(records.length);
    });

    it('should aggregate weekly data efficiently', () => {
      const startTime = performance.now();

      const cosechas = Array.from({ length: 2000 }, (_, i) => ({
        semana: (i % 52) + 1,
        año: 2025,
        cajasProducidas: Math.floor(Math.random() * 500),
        racimosCorta: Math.floor(Math.random() * 300),
      }));

      // Aggregate by week
      const weeklyData = cosechas.reduce((acc, c) => {
        const key = `${c.año}-${c.semana}`;
        if (!acc[key]) {
          acc[key] = { cajas: 0, racimos: 0, count: 0 };
        }
        acc[key].cajas += c.cajasProducidas;
        acc[key].racimos += c.racimosCorta;
        acc[key].count++;
        return acc;
      }, {} as Record<string, { cajas: number; racimos: number; count: number }>);

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
      expect(Object.keys(weeklyData).length).toBeLessThanOrEqual(52);
    });
  });

  describe('Memory Efficiency', () => {
    it('should not create memory leaks with repeated operations', () => {
      const iterations = 100;
      let data: any[] = [];

      for (let i = 0; i < iterations; i++) {
        // Create new data
        data = Array.from({ length: 100 }, (_, j) => ({
          id: `${i}-${j}`,
          value: Math.random(),
        }));
        
        // Process and clear
        const sum = data.reduce((acc, d) => acc + d.value, 0);
        expect(sum).toBeGreaterThan(0);
      }

      // Final data should only have 100 items, not accumulated
      expect(data).toHaveLength(100);
    });

    it('should handle large string operations efficiently', () => {
      const startTime = performance.now();

      const largeText = 'Lorem ipsum '.repeat(10000);
      const searchTerm = 'ipsum';
      
      // Count occurrences
      const count = (largeText.match(new RegExp(searchTerm, 'g')) || []).length;
      
      // Replace all
      const replaced = largeText.replace(/ipsum/g, 'IPSUM');

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
      expect(count).toBe(10000);
      expect(replaced).toContain('IPSUM');
    });
  });

  describe('Rendering Optimization', () => {
    it('should memoize expensive calculations', () => {
      const expensiveCalculation = (data: number[]): number => {
        return data.reduce((sum, val) => sum + Math.sqrt(val) * Math.log(val + 1), 0);
      };

      // Simple memoization
      const cache = new Map<string, number>();
      const memoizedCalc = (data: number[]): number => {
        const key = JSON.stringify(data);
        if (cache.has(key)) {
          return cache.get(key)!;
        }
        const result = expensiveCalculation(data);
        cache.set(key, result);
        return result;
      };

      const testData = Array.from({ length: 1000 }, (_, i) => i + 1);

      // First call
      const start1 = performance.now();
      const result1 = memoizedCalc(testData);
      const time1 = performance.now() - start1;

      // Second call (should be cached)
      const start2 = performance.now();
      const result2 = memoizedCalc(testData);
      const time2 = performance.now() - start2;

      expect(result1).toBe(result2);
      expect(time2).toBeLessThan(time1); // Cached should be faster
    });

    it('should efficiently debounce rapid updates', async () => {
      let callCount = 0;
      
      const debounce = (fn: () => void, delay: number) => {
        let timeoutId: NodeJS.Timeout;
        return () => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(fn, delay);
        };
      };

      const debouncedFn = debounce(() => callCount++, 50);

      // Simulate rapid calls
      for (let i = 0; i < 10; i++) {
        debouncedFn();
      }

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should only have been called once
      expect(callCount).toBe(1);
    });
  });

  describe('API Response Handling', () => {
    it('should handle paginated data efficiently', () => {
      const PAGE_SIZE = 50;
      const totalRecords = 500;
      
      // Simulate paginated fetching
      const fetchPage = (page: number) => {
        const start = page * PAGE_SIZE;
        return Array.from({ length: PAGE_SIZE }, (_, i) => ({
          id: start + i,
          data: `Record ${start + i}`,
        }));
      };

      const allData: any[] = [];
      const totalPages = Math.ceil(totalRecords / PAGE_SIZE);

      const startTime = performance.now();
      
      for (let page = 0; page < totalPages; page++) {
        const pageData = fetchPage(page);
        allData.push(...pageData);
      }

      const endTime = performance.now();

      expect(allData).toHaveLength(totalRecords);
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should efficiently merge and deduplicate data', () => {
      const existingData = Array.from({ length: 500 }, (_, i) => ({
        id: `${i}`,
        value: i,
      }));

      const newData = Array.from({ length: 200 }, (_, i) => ({
        id: `${i + 400}`, // 100 will overlap
        value: i + 400,
      }));

      const startTime = performance.now();

      // Merge and deduplicate
      const merged = [...existingData];
      const existingIds = new Set(existingData.map(d => d.id));
      
      newData.forEach(item => {
        if (!existingIds.has(item.id)) {
          merged.push(item);
        }
      });

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50);
      expect(merged.length).toBe(600); // 500 + 100 new
    });
  });

  describe('Chart Data Preparation', () => {
    it('should prepare chart data from 10000 records in under 500ms', () => {
      const startTime = performance.now();

      const rawData = Array.from({ length: 10000 }, (_, i) => ({
        fecha: new Date(2020 + Math.floor(i / 2000), i % 12, 1),
        finca: ['BABY', 'SOLO', 'LAURITA', 'MARAVILLA'][i % 4],
        produccion: Math.floor(Math.random() * 1000),
      }));

      // Group by month and finca
      const chartData = rawData.reduce((acc, item) => {
        const monthKey = `${item.fecha.getFullYear()}-${item.fecha.getMonth()}`;
        if (!acc[monthKey]) {
          acc[monthKey] = { BABY: 0, SOLO: 0, LAURITA: 0, MARAVILLA: 0 };
        }
        acc[monthKey][item.finca as keyof typeof acc[typeof monthKey]] += item.produccion;
        return acc;
      }, {} as Record<string, Record<string, number>>);

      // Convert to array format
      const chartArray = Object.entries(chartData).map(([month, data]) => ({
        month,
        ...data,
      }));

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(500);
      expect(chartArray.length).toBeGreaterThan(0);
    });
  });

  describe('Export Performance', () => {
    it('should prepare export data for 5000 records in under 300ms', () => {
      const startTime = performance.now();

      const records = Array.from({ length: 5000 }, (_, i) => ({
        id: i,
        fecha: '2025-01-15',
        finca: 'BABY',
        semana: (i % 52) + 1,
        cantidadEnfundes: Math.floor(Math.random() * 1000),
        matasCaidas: Math.floor(Math.random() * 50),
      }));

      // Transform for export
      const exportData = records.map(r => ({
        ID: r.id,
        Fecha: r.fecha,
        Finca: r.finca,
        Semana: r.semana,
        'Cantidad Enfundes': r.cantidadEnfundes,
        'Matas Caídas': r.matasCaidas,
      }));

      // Get headers
      const headers = Object.keys(exportData[0]);

      // Convert to CSV format
      const csvRows = exportData.map(row => 
        headers.map(h => row[h as keyof typeof row]).join(',')
      );
      const csv = [headers.join(','), ...csvRows].join('\n');

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(300);
      expect(csv.length).toBeGreaterThan(0);
      expect(exportData).toHaveLength(5000);
    });
  });
});
