/**
 * Tests para el API Client
 */

import { apiClient } from '@/src/lib/api-client';

describe('ApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    localStorage.getItem = jest.fn();
    localStorage.setItem = jest.fn();
    localStorage.removeItem = jest.fn();
  });

  describe('Token Management', () => {
    it('should set token in localStorage', () => {
      apiClient.setToken('test-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'test-token');
    });

    it('should remove token when setting null', () => {
      apiClient.setToken(null);
      expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
    });
  });

  describe('Login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResponse = {
        access: 'access-token',
        refresh: 'refresh-token',
        usuario: {
          id: '1',
          nombre: 'Test User',
          email: 'test@test.com',
          rol: 'administrador',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await apiClient.login('test@test.com', 'password123');

      expect(result.data).toBeDefined();
      expect(result.data?.access).toBe('access-token');
      expect(result.data?.usuario.email).toBe('test@test.com');
    });

    it('should return error on invalid credentials', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ detail: 'Credenciales inválidas' }),
      });

      const result = await apiClient.login('wrong@test.com', 'wrongpassword');

      expect(result.error).toBeDefined();
      expect(result.status).toBe(401);
    });
  });

  describe('GET Requests', () => {
    it('should fetch fincas successfully', async () => {
      const mockFincas = [
        { id: '1', nombre: 'BABY', hectareas: 100 },
        { id: '2', nombre: 'SOLO', hectareas: 80 },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockFincas,
      });

      const result = await apiClient.getFincas();

      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].nombre).toBe('BABY');
    });

    it('should fetch enfundes with parameters', async () => {
      const mockEnfundes = [
        { id: '1', finca: 'BABY', semana: 1, año: 2025, cantidad_enfundes: 500 },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockEnfundes,
      });

      const result = await apiClient.getEnfundes({ finca: 'BABY', semana: 1 });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('finca=BABY'),
        expect.any(Object)
      );
      expect(result.data).toHaveLength(1);
    });

    it('should fetch cosechas successfully', async () => {
      const mockCosechas = [
        { id: '1', finca: 'BABY', semana: 1, año: 2025, cajas_producidas: 1000 },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockCosechas,
      });

      const result = await apiClient.getCosechas();

      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].cajas_producidas).toBe(1000);
    });

    it('should fetch empleados successfully', async () => {
      const mockEmpleados = [
        { id: '1', nombre: 'Juan Perez', cedula: '0912345678', labor: 'Cosecha' },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockEmpleados,
      });

      const result = await apiClient.getEmpleados();

      expect(result.data).toHaveLength(1);
    });

    it('should fetch insumos successfully', async () => {
      const mockInsumos = [
        { id: '1', nombre: 'Fertilizante', stock_actual: 100, stock_minimo: 50 },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockInsumos,
      });

      const result = await apiClient.getInsumos();

      expect(result.data).toHaveLength(1);
    });

    it('should fetch alertas successfully', async () => {
      const mockAlertas = [
        { id: '1', tipo: 'warning', titulo: 'Stock bajo', leida: false },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockAlertas,
      });

      const result = await apiClient.getAlertas({ leida: false });

      expect(result.data).toHaveLength(1);
    });
  });

  describe('POST Requests', () => {
    it('should create enfunde successfully', async () => {
      const newEnfunde = {
        finca: 'BABY',
        semana: 1,
        año: 2025,
        cantidad_enfundes: 500,
        color_cinta: 'azul',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: '1', ...newEnfunde }),
      });

      const result = await apiClient.createEnfunde(newEnfunde);

      expect(result.data?.id).toBe('1');
      expect(result.status).toBe(201);
    });

    it('should create cosecha successfully', async () => {
      const newCosecha = {
        finca: 'BABY',
        semana: 1,
        año: 2025,
        cajas_producidas: 1000,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: '1', ...newCosecha }),
      });

      const result = await apiClient.createCosecha(newCosecha);

      expect(result.data?.id).toBe('1');
    });
  });

  describe('PATCH Requests', () => {
    it('should update enfunde successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: '1', cantidad_enfundes: 600 }),
      });

      const result = await apiClient.updateEnfunde('1', { cantidad_enfundes: 600 });

      expect(result.data?.cantidad_enfundes).toBe(600);
    });
  });

  describe('DELETE Requests', () => {
    it('should delete enfunde successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: async () => ({}),
      });

      const result = await apiClient.deleteEnfunde('1');

      expect(result.status).toBe(204);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await apiClient.getFincas();

      expect(result.error).toBe('Network error');
      expect(result.status).toBe(0);
    });

    it('should handle 401 unauthorized', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ detail: 'No autorizado' }),
      });

      const result = await apiClient.getFincas();

      expect(result.status).toBe(401);
      expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
    });

    it('should handle validation errors from backend', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ 
          cantidad_enfundes: ['Este campo es requerido'],
          finca: ['Este campo es requerido'],
        }),
      });

      const result = await apiClient.createEnfunde({});

      expect(result.error).toContain('cantidad_enfundes');
      expect(result.error).toContain('finca');
    });
  });
});
