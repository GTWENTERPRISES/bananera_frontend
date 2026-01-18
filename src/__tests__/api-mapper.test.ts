/**
 * Tests para API Mapper - Transformación de datos backend <-> frontend
 */

import {
  mapFinca,
  mapUser,
  mapEnfunde,
  mapCosecha,
  mapEmpleado,
  mapInsumo,
  mapAlerta,
  toBackendFormat,
} from '@/src/lib/api-mapper';

describe('API Mapper', () => {
  describe('mapFinca', () => {
    it('should map backend finca to frontend format', () => {
      const backendFinca = {
        id: 'uuid-123',
        nombre: 'BABY',
        hectareas: 100.5,
        ubicacion: 'Guayas',
        responsable: 'Juan Perez',
        variedad: 'Cavendish',
        plantas_totales: 50000,
        fecha_siembra: '2020-01-15',
        estado: 'activa',
      };

      const result = mapFinca(backendFinca);

      expect(result.id).toBe('uuid-123');
      expect(result.nombre).toBe('BABY');
      expect(result.hectareas).toBe(100.5);
      expect(result.variedad).toBe('Cavendish');
      expect(result.estado).toBe('activa');
    });

    it('should handle missing optional fields', () => {
      const backendFinca = {
        id: 'uuid-123',
        nombre: 'BABY',
        hectareas: 100,
      };

      const result = mapFinca(backendFinca);

      expect(result.id).toBe('uuid-123');
      expect(result.ubicacion).toBeUndefined();
    });
  });

  describe('mapUser', () => {
    it('should map backend user to frontend format', () => {
      const backendUser = {
        id: 'uuid-456',
        nombre: 'Admin User',
        email: 'admin@bananera.com',
        rol: 'administrador',
        finca_asignada: 'uuid-finca-1',
        telefono: '0999999999',
        activo: true,
      };

      const result = mapUser(backendUser);

      expect(result.id).toBe('uuid-456');
      expect(result.nombre).toBe('Admin User');
      expect(result.email).toBe('admin@bananera.com');
      expect(result.rol).toBe('administrador');
      expect(result.fincaAsignada).toBe('uuid-finca-1');
      expect(result.activo).toBe(true);
    });
  });

  describe('mapEnfunde', () => {
    it('should map backend enfunde to frontend format', () => {
      const backendEnfunde = {
        id: 'uuid-789',
        finca: 'uuid-finca-1',
        finca_nombre: 'BABY',
        semana: 10,
        año: 2025,
        color_cinta: 'azul',
        cantidad_enfundes: 500,
        matas_caidas: 10,
        fecha: '2025-03-10',
        lote: 'A',
      };

      const result = mapEnfunde(backendEnfunde);

      expect(result.id).toBe('uuid-789');
      expect(result.finca).toBe('uuid-finca-1');
      expect(result.fincaNombre).toBe('BABY');
      expect(result.semana).toBe(10);
      expect(result.año).toBe(2025);
      expect(result.colorCinta).toBe('azul');
      expect(result.cantidadEnfundes).toBe(500);
      expect(result.matasCaidas).toBe(10);
    });

    it('should handle missing optional fields gracefully', () => {
      const backendEnfunde = {
        id: 'uuid-789',
        finca: 'uuid-finca-1',
        semana: 10,
        año: 2025,
        color_cinta: 'azul',
        cantidad_enfundes: 100,
        matas_caidas: 5,
        fecha: '2025-03-10',
        // finca_nombre and lote are optional
      };

      const result = mapEnfunde(backendEnfunde);

      expect(result.id).toBe('uuid-789');
      expect(result.cantidadEnfundes).toBe(100);
      // Mapper provides default value for missing finca_nombre
      expect(result.fincaNombre).toBe('Sin asignar');
    });
  });

  describe('mapCosecha', () => {
    it('should map backend cosecha to frontend format', () => {
      const backendCosecha = {
        id: 'uuid-cos-1',
        finca: 'uuid-finca-1',
        finca_nombre: 'BABY',
        semana: 10,
        año: 2025,
        racimos_corta: 1000,
        racimos_rechazados: 50,
        racimos_recuperados: 30,
        cajas_producidas: 800,
        peso_promedio: 42.5,
        calibracion: 46,
        numero_manos: 9.5,
        ratio: 2.1,
        merma: 5.0,
      };

      const result = mapCosecha(backendCosecha);

      expect(result.id).toBe('uuid-cos-1');
      expect(result.racimosCorta).toBe(1000);
      expect(result.racimosRechazados).toBe(50);
      expect(result.cajasProducidas).toBe(800);
      expect(result.pesoPromedio).toBe(42.5);
      expect(result.ratio).toBe(2.1);
      expect(result.merma).toBe(5.0);
    });
  });

  describe('mapEmpleado', () => {
    it('should map backend empleado to frontend format', () => {
      const backendEmpleado = {
        id: 'uuid-emp-1',
        nombre: 'Juan Perez',
        cedula: '0912345678',
        finca: 'uuid-finca-1',
        finca_nombre: 'BABY',
        labor: 'Cosecha',
        lote: 'A',
        tarifa_diaria: 25.00,
        fecha_ingreso: '2023-01-15',
        activo: true,
      };

      const result = mapEmpleado(backendEmpleado);

      expect(result.id).toBe('uuid-emp-1');
      expect(result.nombre).toBe('Juan Perez');
      expect(result.cedula).toBe('0912345678');
      expect(result.labor).toBe('Cosecha');
      expect(result.tarifaDiaria).toBe(25.00);
      expect(result.activo).toBe(true);
    });
  });

  describe('mapInsumo', () => {
    it('should map backend insumo to frontend format', () => {
      const backendInsumo = {
        id: 'uuid-ins-1',
        nombre: 'Fertilizante NPK',
        categoria: 'fertilizante',
        proveedor: 'AgroSupply',
        unidad_medida: 'kg',
        stock_actual: 500,
        stock_minimo: 100,
        stock_maximo: 1000,
        precio_unitario: 15.50,
        fecha_vencimiento: '2026-06-01',
      };

      const result = mapInsumo(backendInsumo);

      expect(result.id).toBe('uuid-ins-1');
      expect(result.nombre).toBe('Fertilizante NPK');
      expect(result.categoria).toBe('fertilizante');
      expect(result.stockActual).toBe(500);
      expect(result.stockMinimo).toBe(100);
      expect(result.precioUnitario).toBe(15.50);
    });
  });

  describe('mapAlerta', () => {
    it('should map backend alerta to frontend format', () => {
      const backendAlerta = {
        id: 'uuid-alert-1',
        tipo: 'warning',
        modulo: 'inventario',
        titulo: 'Stock Bajo',
        descripcion: 'Fertilizante NPK está por debajo del mínimo',
        fecha: '2025-03-10T10:00:00Z',
        leida: false,
        accion_requerida: 'Realizar pedido',
        finca: 'BABY',
        roles_permitidos: ['administrador', 'bodeguero'],
      };

      const result = mapAlerta(backendAlerta);

      expect(result.id).toBe('uuid-alert-1');
      expect(result.tipo).toBe('warning');
      expect(result.modulo).toBe('inventario');
      expect(result.titulo).toBe('Stock Bajo');
      expect(result.leida).toBe(false);
      expect(result.rolesPermitidos).toContain('administrador');
    });
  });

  describe('toBackendFormat', () => {
    it('should convert frontend enfunde to backend format', () => {
      const frontendEnfunde = {
        id: 'uuid-789',
        finca: 'BABY',
        semana: 10,
        año: 2025,
        colorCinta: 'azul',
        cantidadEnfundes: 500,
        matasCaidas: 10,
        fecha: '2025-03-10',
      };

      const mockFincas = [
        { id: 'uuid-finca-1', nombre: 'BABY', hectareas: 100 },
      ];

      const result = toBackendFormat(frontendEnfunde, mockFincas);

      expect(result.color_cinta).toBe('azul');
      expect(result.cantidad_enfundes).toBe(500);
      expect(result.matas_caidas).toBe(10);
    });

    it('should convert frontend cosecha to backend format', () => {
      const frontendCosecha = {
        id: 'uuid-cos-1',
        finca: 'BABY',
        semana: 10,
        año: 2025,
        racimosCorta: 1000,
        racimosRechazados: 50,
        cajasProducidas: 800,
        pesoPromedio: 42.5,
        ratio: 2.1,
        merma: 5.0,
      };

      const mockFincas = [
        { id: 'uuid-finca-1', nombre: 'BABY', hectareas: 100 },
      ];

      const result = toBackendFormat(frontendCosecha, mockFincas);

      expect(result.racimos_corta).toBe(1000);
      expect(result.cajas_producidas).toBe(800);
      expect(result.peso_promedio).toBe(42.5);
    });
  });
});
