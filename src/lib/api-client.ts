/**
 * API Client para conectar con el backend Django
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status?: number;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('accessToken', token);
      } else {
        localStorage.removeItem('accessToken');
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          this.token = null;
        }
        return {
          error: data.detail || 'No autorizado',
          status: response.status,
        };
      }

      if (!response.ok) {
        let errorMessage = data.detail || data.error;
        if (!errorMessage && typeof data === 'object') {
          const fieldErrors = Object.entries(data)
            .filter(([_, v]) => Array.isArray(v))
            .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
            .join('; ');
          if (fieldErrors) {
            errorMessage = fieldErrors;
          }
        }
        return {
          error: errorMessage || `Error ${response.status}`,
          status: response.status,
        };
      }

      return { data, status: response.status };
    } catch (error) {
      return { error: 'Error de conexión con el servidor' };
    }
  }

  // Auth
  async login(email: string, password: string): Promise<ApiResponse<{ access: string; refresh: string }>> {
    const response = await this.request<{ access: string; refresh: string }>('/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.data?.access) {
      this.setToken(response.data.access);
    }
    
    return response;
  }

  // User info
  async getCurrentUser(): Promise<ApiResponse<any>> {
    return this.request('/usuarios/me/');
  }

  // Fincas
  async getFincas(): Promise<ApiResponse<any[]>> {
    return this.request('/fincas/');
  }

  async createFinca(data: any): Promise<ApiResponse<any>> {
    return this.request('/fincas/', { method: 'POST', body: JSON.stringify(data) });
  }

  // Usuarios
  async getUsuarios(): Promise<ApiResponse<any[]>> {
    return this.request('/usuarios/');
  }

  async createUsuario(data: any): Promise<ApiResponse<any>> {
    return this.request('/usuarios/', { method: 'POST', body: JSON.stringify(data) });
  }

  // Enfundes
  async getEnfundes(): Promise<ApiResponse<any[]>> {
    return this.request('/enfundes/');
  }

  async createEnfunde(data: any): Promise<ApiResponse<any>> {
    return this.request('/enfundes/', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateEnfunde(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/enfundes/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async deleteEnfunde(id: string): Promise<ApiResponse<void>> {
    return this.request(`/enfundes/${id}/`, { method: 'DELETE' });
  }

  // Cosechas
  async getCosechas(): Promise<ApiResponse<any[]>> {
    return this.request('/cosechas/');
  }

  async createCosecha(data: any): Promise<ApiResponse<any>> {
    return this.request('/cosechas/', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateCosecha(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/cosechas/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async deleteCosecha(id: string): Promise<ApiResponse<void>> {
    return this.request(`/cosechas/${id}/`, { method: 'DELETE' });
  }

  // Recuperaciones
  async getRecuperaciones(): Promise<ApiResponse<any[]>> {
    return this.request('/recuperaciones/');
  }

  async createRecuperacion(data: any): Promise<ApiResponse<any>> {
    return this.request('/recuperaciones/', { method: 'POST', body: JSON.stringify(data) });
  }

  // Empleados
  async getEmpleados(): Promise<ApiResponse<any[]>> {
    return this.request('/empleados/');
  }

  async createEmpleado(data: any): Promise<ApiResponse<any>> {
    return this.request('/empleados/', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateEmpleado(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/empleados/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async deleteEmpleado(id: string): Promise<ApiResponse<void>> {
    return this.request(`/empleados/${id}/`, { method: 'DELETE' });
  }

  // Roles de Pago
  async getRolesPago(): Promise<ApiResponse<any[]>> {
    return this.request('/roles-pago/');
  }

  async createRolPago(data: any): Promise<ApiResponse<any>> {
    return this.request('/roles-pago/', { method: 'POST', body: JSON.stringify(data) });
  }

  // Préstamos
  async getPrestamos(): Promise<ApiResponse<any[]>> {
    return this.request('/prestamos/');
  }

  async createPrestamo(data: any): Promise<ApiResponse<any>> {
    return this.request('/prestamos/', { method: 'POST', body: JSON.stringify(data) });
  }

  async updatePrestamo(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/prestamos/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  // Insumos
  async getInsumos(): Promise<ApiResponse<any[]>> {
    return this.request('/insumos/');
  }

  async createInsumo(data: any): Promise<ApiResponse<any>> {
    return this.request('/insumos/', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateInsumo(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/insumos/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  // Movimientos Inventario
  async getMovimientos(): Promise<ApiResponse<any[]>> {
    return this.request('/movimientos-inventario/');
  }

  async createMovimiento(data: any): Promise<ApiResponse<any>> {
    return this.request('/movimientos-inventario/', { method: 'POST', body: JSON.stringify(data) });
  }

  // Alertas
  async getAlertas(params?: { leida?: boolean }): Promise<ApiResponse<any[]>> {
    const query = params?.leida !== undefined ? `?leida=${params.leida}` : '';
    return this.request(`/alertas/${query}`);
  }

  async marcarAlertaLeida(id: string): Promise<ApiResponse<any>> {
    return this.request(`/alertas/${id}/`, { method: 'PATCH', body: JSON.stringify({ leida: true }) });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
