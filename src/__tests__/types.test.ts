/**
 * Tests para validación de Types
 */

import type {
  Finca,
  User,
  Enfunde,
  Cosecha,
  Empleado,
  Insumo,
  Alerta,
  RolPago,
  Prestamo,
  UserRole,
  FincaName,
  ColorCinta,
  LaborEmpleado,
  CategoriaInsumo,
} from '@/src/lib/types';

describe('Types Validation', () => {
  describe('UserRole', () => {
    it('should accept valid user roles', () => {
      const validRoles: UserRole[] = [
        'administrador',
        'gerente',
        'supervisor_finca',
        'contador_rrhh',
        'bodeguero',
      ];

      validRoles.forEach((role) => {
        expect(typeof role).toBe('string');
      });
    });
  });

  describe('FincaName', () => {
    it('should accept valid finca names', () => {
      const validNames: FincaName[] = ['BABY', 'SOLO', 'LAURITA', 'MARAVILLA'];

      validNames.forEach((name) => {
        expect(typeof name).toBe('string');
        expect(name).toMatch(/^[A-Z]+$/);
      });
    });
  });

  describe('ColorCinta', () => {
    it('should accept valid cinta colors', () => {
      const validColors: ColorCinta[] = [
        'azul', 'rojo', 'amarillo', 'verde', 
        'naranja', 'morado', 'rosado', 'blanco'
      ];

      expect(validColors).toHaveLength(8);
    });
  });

  describe('LaborEmpleado', () => {
    it('should accept valid labor types', () => {
      const validLabors: LaborEmpleado[] = [
        'Enfunde', 'Cosecha', 'Calibración', 'Varios',
        'Administrador', 'Supervisor', 'Fumigación', 'Mantenimiento'
      ];

      expect(validLabors).toHaveLength(8);
    });
  });

  describe('CategoriaInsumo', () => {
    it('should accept valid insumo categories', () => {
      const validCategories: CategoriaInsumo[] = [
        'fertilizante', 'protector', 'herramienta', 'empaque', 'otro'
      ];

      expect(validCategories).toHaveLength(5);
    });
  });

  describe('Finca Type', () => {
    it('should validate finca structure', () => {
      const finca: Finca = {
        id: 'uuid-123',
        nombre: 'BABY',
        hectareas: 100,
        ubicacion: 'Guayas',
        responsable: 'Juan Perez',
        variedad: 'Cavendish',
        plantasTotales: 50000,
        fechaSiembra: '2020-01-15',
        estado: 'activa',
      };

      expect(finca.id).toBeDefined();
      expect(finca.nombre).toBeDefined();
      expect(finca.hectareas).toBeGreaterThan(0);
    });
  });

  describe('Enfunde Type', () => {
    it('should validate enfunde structure', () => {
      const enfunde: Enfunde = {
        id: 'uuid-456',
        finca: 'uuid-finca-1',
        fincaNombre: 'BABY',
        semana: 10,
        año: 2025,
        colorCinta: 'azul',
        cantidadEnfundes: 500,
        matasCaidas: 10,
        fecha: '2025-03-10',
        lote: 'A',
      };

      expect(enfunde.semana).toBeGreaterThanOrEqual(1);
      expect(enfunde.semana).toBeLessThanOrEqual(53);
      expect(enfunde.año).toBeGreaterThanOrEqual(2020);
      expect(enfunde.cantidadEnfundes).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Cosecha Type', () => {
    it('should validate cosecha structure', () => {
      const cosecha: Cosecha = {
        id: 'uuid-789',
        finca: 'uuid-finca-1',
        fincaNombre: 'BABY',
        semana: 10,
        año: 2025,
        racimosCorta: 1000,
        racimosRechazados: 50,
        racimosRecuperados: 30,
        cajasProducidas: 800,
        pesoPromedio: 42.5,
        calibracion: 46,
        numeroManos: 9.5,
        ratio: 2.1,
        merma: 5.0,
      };

      expect(cosecha.racimosCorta).toBeGreaterThanOrEqual(0);
      expect(cosecha.cajasProducidas).toBeLessThanOrEqual(cosecha.racimosCorta);
      expect(cosecha.ratio).toBeGreaterThan(0);
    });
  });

  describe('Empleado Type', () => {
    it('should validate empleado structure', () => {
      const empleado: Empleado = {
        id: 'uuid-emp-1',
        nombre: 'Juan Perez',
        cedula: '0912345678',
        finca: 'uuid-finca-1',
        fincaNombre: 'BABY',
        labor: 'Cosecha',
        tarifaDiaria: 25.00,
        fechaIngreso: '2023-01-15',
        activo: true,
      };

      expect(empleado.cedula).toHaveLength(10);
      expect(empleado.tarifaDiaria).toBeGreaterThan(0);
    });
  });

  describe('Insumo Type', () => {
    it('should validate insumo structure', () => {
      const insumo: Insumo = {
        id: 'uuid-ins-1',
        nombre: 'Fertilizante NPK',
        categoria: 'fertilizante',
        proveedor: 'AgroSupply',
        unidadMedida: 'kg',
        stockActual: 500,
        stockMinimo: 100,
        stockMaximo: 1000,
        precioUnitario: 15.50,
      };

      expect(insumo.stockMinimo).toBeLessThan(insumo.stockMaximo);
      expect(insumo.precioUnitario).toBeGreaterThan(0);
    });

    it('should detect low stock correctly', () => {
      const insumo: Insumo = {
        id: 'uuid-ins-1',
        nombre: 'Fertilizante NPK',
        categoria: 'fertilizante',
        proveedor: 'AgroSupply',
        unidadMedida: 'kg',
        stockActual: 50,
        stockMinimo: 100,
        stockMaximo: 1000,
        precioUnitario: 15.50,
      };

      const isLowStock = insumo.stockActual < insumo.stockMinimo;
      expect(isLowStock).toBe(true);
    });
  });

  describe('Alerta Type', () => {
    it('should validate alerta structure', () => {
      const alerta: Alerta = {
        id: 'uuid-alert-1',
        tipo: 'advertencia',
        modulo: 'inventario',
        titulo: 'Stock Bajo',
        descripcion: 'Fertilizante NPK está por debajo del mínimo',
        fecha: new Date().toISOString(),
        leida: false,
        rolesPermitidos: ['administrador', 'bodeguero'],
      };

      expect(['critico', 'advertencia', 'info']).toContain(alerta.tipo);
      expect(alerta.rolesPermitidos.length).toBeGreaterThan(0);
    });
  });

  describe('RolPago Type', () => {
    it('should validate rol pago calculations', () => {
      const rolPago: RolPago = {
        id: 'uuid-rol-1',
        empleadoId: 'uuid-emp-1',
        empleado: {
          id: 'uuid-emp-1',
          nombre: 'Juan Perez',
          cedula: '0912345678',
          finca: 'uuid-finca-1',
          labor: 'Cosecha',
          tarifaDiaria: 25.00,
          fechaIngreso: '2023-01-15',
          activo: true,
        },
        finca: 'BABY',
        semana: 10,
        año: 2025,
        diasLaborados: 6,
        sueldoBase: 150,
        cosecha: 50,
        tareasEspeciales: 20,
        totalIngresos: 220,
        iess: 20.79,
        multas: 0,
        prestamos: 0,
        totalEgresos: 20.79,
        netoAPagar: 199.21,
        estado: 'pendiente',
      };

      // Validate calculations
      const calculatedIngresos = rolPago.sueldoBase + rolPago.cosecha + rolPago.tareasEspeciales;
      expect(rolPago.totalIngresos).toBe(calculatedIngresos);

      const calculatedEgresos = rolPago.iess + rolPago.multas + rolPago.prestamos;
      expect(Math.abs(rolPago.totalEgresos - calculatedEgresos)).toBeLessThan(0.01);

      const calculatedNeto = rolPago.totalIngresos - rolPago.totalEgresos;
      expect(Math.abs(rolPago.netoAPagar - calculatedNeto)).toBeLessThan(0.01);
    });
  });

  describe('Prestamo Type', () => {
    it('should validate prestamo structure', () => {
      const prestamo: Prestamo = {
        id: 'uuid-pres-1',
        empleadoId: 'uuid-emp-1',
        empleado: {
          id: 'uuid-emp-1',
          nombre: 'Juan Perez',
          cedula: '0912345678',
          finca: 'uuid-finca-1',
          labor: 'Cosecha',
          tarifaDiaria: 25.00,
          fechaIngreso: '2023-01-15',
          activo: true,
        },
        monto: 500,
        fechaDesembolso: '2025-01-15',
        numeroCuotas: 10,
        valorCuota: 50,
        cuotasPagadas: 3,
        saldoPendiente: 350,
        estado: 'activo',
      };

      expect(prestamo.valorCuota * prestamo.numeroCuotas).toBe(prestamo.monto);
      expect(prestamo.cuotasPagadas).toBeLessThanOrEqual(prestamo.numeroCuotas);
      expect(prestamo.saldoPendiente).toBe(
        prestamo.monto - (prestamo.cuotasPagadas * prestamo.valorCuota)
      );
    });
  });
});
