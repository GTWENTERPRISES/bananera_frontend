"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import type {
  User,
  Enfunde,
  Cosecha,
  Empleado,
  RolPago,
  Prestamo,
  Insumo,
  MovimientoInventario,
  Alerta,
  RecuperacionCinta,
  Finca,
  UserRole,
} from "@/src/lib/types";
// Mock data removido - todos los datos vienen del backend API
import { Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
  theme: "light" | "dark";
  enfundes: Enfunde[];
  cosechas: Cosecha[];
  recuperacionCintas: RecuperacionCinta[];
  empleados: Empleado[];
  rolesPago: RolPago[];
  prestamos: Prestamo[];
  insumos: Insumo[];
  movimientosInventario: MovimientoInventario[];
  alertas: Alerta[];
  fincas: Finca[];
  usuarios: User[];
}

interface AppContextType {
  state: AppState;

  // User & Auth
  setCurrentUser: (user: User | null) => void;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;

  // RBAC
  canAccess: (resource: "dashboard" | "produccion" | "nomina" | "inventario" | "reportes" | "configuracion" | "analytics" | "geovisualizacion", action?: "view" | "edit") => boolean;

  // Theme
  toggleTheme: () => void;

  // Producción
  addEnfunde: (enfunde: Enfunde) => Promise<any>;
  addCosecha: (cosecha: Cosecha) => Promise<any>;
  updateEnfunde: (id: string, enfunde: Partial<Enfunde>) => Promise<void>;
  updateCosecha: (id: string, cosecha: Partial<Cosecha>) => Promise<void>;
  deleteEnfunde: (id: string) => Promise<void>;
  deleteCosecha: (id: string) => Promise<void>;
  replaceEnfundes: (data: Enfunde[]) => void;
  addRecuperacionCinta: (recuperacion: RecuperacionCinta) => Promise<any>;
  updateRecuperacionCinta: (id: string, recuperacion: Partial<RecuperacionCinta>) => void;
  deleteRecuperacionCinta: (id: string) => Promise<void>;

  // Nómina
  addEmpleado: (empleado: Empleado) => Promise<any>;
  updateEmpleado: (id: string, empleado: Partial<Empleado>) => Promise<void>;
  deleteEmpleado: (id: string) => Promise<void>;
  addRolPago: (rol: RolPago) => Promise<any>;
  addPrestamo: (prestamo: Prestamo) => Promise<any>;
  updatePrestamo: (id: string, prestamo: Partial<Prestamo>) => Promise<void>;
  updateRolPagoEstado: (id: string, estado: "pendiente" | "pagado") => void;

  // Inventario
  addInsumo: (insumo: Insumo) => Promise<any>;
  updateInsumo: (id: string, insumo: Partial<Insumo>) => Promise<void>;
  addMovimientoInventario: (movimiento: MovimientoInventario) => Promise<void>;
  generarOrdenCompra: (insumoId: string) => void;

  // Alertas
  addAlerta: (alerta: Alerta) => void;
  marcarAlertaLeida: (id: string) => void;

  // Configuración
  addFinca: (finca: Finca) => Promise<any>;
  updateFinca: (id: string, finca: Partial<Finca>) => Promise<void>;
  deleteFinca: (id: string) => Promise<void>;
  addUsuario: (usuario: User) => void;
  updateUsuario: (id: string, usuario: Partial<User>) => void;
  deleteUsuario: (id: string) => void;

  // Filtered data getters (por finca del usuario)
  getFilteredEnfundes: () => Enfunde[];
  getFilteredCosechas: () => Cosecha[];
  getFilteredRecuperaciones: () => RecuperacionCinta[];
  getFilteredEmpleados: () => Empleado[];
  getFilteredRolesPago: () => RolPago[];
  getFilteredPrestamos: () => Prestamo[];
  getFilteredInsumos: () => Insumo[];
  getFilteredMovimientos: () => MovimientoInventario[];

  // Direct access helpers
  currentUser: User | null;
  enfundes: Enfunde[];
  cosechas: Cosecha[];
  empleados: Empleado[];
  rolesPago: RolPago[];
  prestamos: Prestamo[];
  insumos: Insumo[];
  movimientosInventario: MovimientoInventario[];
  alertas: Alerta[];
  fincas: Finca[];
  usuarios: User[];
  recuperacionCintas: RecuperacionCinta[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    isAuthenticated: false,
    theme: "light",
    enfundes: [],
    cosechas: [],
    recuperacionCintas: [],
    empleados: [],
    rolesPago: [],
    prestamos: [],
    insumos: [],
    movimientosInventario: [],
    alertas: [],
    fincas: [],
    usuarios: [],
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Inicializar desde localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const savedUser = localStorage.getItem("currentUser");
        const savedTheme = localStorage.getItem("theme") as
          | "light"
          | "dark"
          | null;

        if (savedUser) {
          const user = JSON.parse(savedUser);
          setState((prev) => ({
            ...prev,
            currentUser: user,
            isAuthenticated: true,
            theme: savedTheme || "light",
          }));
        }

        if (savedTheme) {
          document.documentElement.classList.toggle(
            "dark",
            savedTheme === "dark"
          );
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing auth:", error);
        // Limpiar localStorage corrupto
        localStorage.removeItem("currentUser");
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Cargar TODOS los datos desde el backend cuando el usuario está autenticado
  useEffect(() => {
    const loadAllDataFromBackend = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      
      const headers = { 'Authorization': `Bearer ${token}` };
      
      try {
        console.log('[API] Cargando todos los datos del backend...');
        
        // Cargar todos los endpoints en paralelo
        const [
          fincasRes, usuariosRes, enfundesRes, cosechasRes, recuperacionesRes,
          empleadosRes, rolesRes, prestamosRes, insumosRes, movimientosRes, alertasRes
        ] = await Promise.all([
          fetch(`${API_URL}/fincas/`, { headers }),
          fetch(`${API_URL}/usuarios/`, { headers }),
          fetch(`${API_URL}/enfundes/`, { headers }),
          fetch(`${API_URL}/cosechas/`, { headers }),
          fetch(`${API_URL}/recuperaciones/`, { headers }),
          fetch(`${API_URL}/empleados/`, { headers }),
          fetch(`${API_URL}/roles-pago/`, { headers }),
          fetch(`${API_URL}/prestamos/`, { headers }),
          fetch(`${API_URL}/insumos/`, { headers }),
          fetch(`${API_URL}/movimientos-inventario/`, { headers }),
          fetch(`${API_URL}/alertas/`, { headers }),
        ]);
        
        // Parsear respuestas
        const fincas = fincasRes.ok ? await fincasRes.json() : [];
        const usuarios = usuariosRes.ok ? await usuariosRes.json() : [];
        const enfundes = enfundesRes.ok ? await enfundesRes.json() : [];
        const cosechas = cosechasRes.ok ? await cosechasRes.json() : [];
        const recuperaciones = recuperacionesRes.ok ? await recuperacionesRes.json() : [];
        const empleados = empleadosRes.ok ? await empleadosRes.json() : [];
        const rolesPago = rolesRes.ok ? await rolesRes.json() : [];
        const prestamos = prestamosRes.ok ? await prestamosRes.json() : [];
        const insumos = insumosRes.ok ? await insumosRes.json() : [];
        const movimientos = movimientosRes.ok ? await movimientosRes.json() : [];
        const alertas = alertasRes.ok ? await alertasRes.json() : [];
        
        console.log('[API] Datos cargados:', {
          fincas: fincas.length,
          usuarios: usuarios.length,
          enfundes: enfundes.length,
          cosechas: cosechas.length,
          empleados: empleados.length,
          rolesPago: rolesPago.length,
          insumos: insumos.length,
        });
        
        // Mapear datos del backend al formato del frontend
        setState((prev) => ({
          ...prev,
          fincas: fincas.map((f: any) => ({
            id: f.id,
            nombre: f.nombre,
            ubicacion: f.ubicacion,
            hectareas: Number(f.hectareas),
            responsable: f.responsable,
            activa: f.activa,
          })),
          usuarios: usuarios.map((u: any) => ({
            id: u.id,
            email: u.email,
            nombre: u.nombre,
            rol: u.rol,
            fincaAsignada: u.finca_asignada,
            fincaNombre: u.finca_nombre,
            telefono: u.telefono,
            activo: u.activo,
          })),
          enfundes: enfundes.map((e: any) => ({
            id: e.id,
            finca: e.finca_nombre,
            fincaId: e.finca,
            fecha: e.fecha,
            semana: e.semana,
            año: e.año,
            colorCinta: e.color_cinta,
            cantidadEnfundes: e.cantidad_enfundes,
            matasCaidas: e.matas_caidas,
            observaciones: e.observaciones,
          })),
          cosechas: cosechas.map((c: any) => ({
            id: c.id,
            finca: c.finca_nombre,
            fincaId: c.finca,
            fecha: c.fecha,
            semana: c.semana,
            año: c.año,
            lote: c.lote,
            cajasProducidas: c.cajas_producidas,
            racimosRecuperados: c.racimos_recuperados,
            pesoPromedio: Number(c.peso_promedio),
            calibracion: Number(c.calibracion),
            numeroManos: c.manos,
            ratio: Number(c.ratio),
          })),
          recuperacionCintas: recuperaciones.map((r: any) => ({
            id: r.id,
            enfundeId: r.enfunde,
            fincaNombre: r.finca_nombre,
            fecha: r.fecha,
            cintasRecuperadas: r.cintas_recuperadas,
            porcentajeRecuperacion: Number(r.porcentaje_recuperacion),
            observaciones: r.observaciones,
          })),
          empleados: empleados.map((e: any) => ({
            id: e.id,
            finca: e.finca_nombre,
            fincaId: e.finca,
            nombre: e.nombre,
            cedula: e.cedula,
            cargo: e.cargo,
            salarioBase: Number(e.salario_base),
            fechaIngreso: e.fecha_ingreso,
            telefono: e.telefono,
            direccion: e.direccion,
            activo: e.activo,
          })),
          rolesPago: rolesPago.map((r: any) => ({
            id: r.id,
            empleadoId: r.empleado,
            empleadoNombre: r.empleado_nombre,
            finca: r.finca_nombre,
            fincaNombre: r.finca_nombre,
            fechaPago: r.fecha_pago,
            periodoInicio: r.periodo_inicio,
            periodoFin: r.periodo_fin,
            salarioBase: Number(r.salario_base),
            horasExtras: Number(r.horas_extras),
            bonificaciones: Number(r.bonificaciones),
            deducciones: Number(r.deducciones),
            totalIngresos: Number(r.salario_base) + Number(r.horas_extras) + Number(r.bonificaciones),
            totalEgresos: Number(r.deducciones),
            netoAPagar: Number(r.total_pagar),
            estado: r.estado,
          })),
          prestamos: prestamos.map((p: any) => ({
            id: p.id,
            empleadoId: p.empleado,
            empleadoNombre: p.empleado_nombre,
            fincaNombre: p.finca_nombre,
            monto: Number(p.monto),
            montoPagado: Number(p.monto_pagado),
            saldoPendiente: Number(p.saldo_pendiente),
            cuotas: p.cuotas,
            numeroCuotas: p.cuotas,
            cuotasPagadas: p.cuotas_pagadas,
            valorCuota: Number(p.monto) / p.cuotas,
            fechaSolicitud: p.fecha_solicitud,
            fechaAprobacion: p.fecha_aprobacion,
            estado: p.estado,
            motivo: p.motivo,
          })),
          insumos: insumos.map((i: any) => ({
            id: i.id,
            finca: i.finca_nombre,
            fincaId: i.finca,
            nombre: i.nombre,
            categoria: i.categoria,
            proveedor: i.proveedor,
            unidadMedida: i.unidad_medida,
            stockActual: Number(i.stock_actual),
            stockMinimo: Number(i.stock_minimo),
            stockMaximo: Number(i.stock_maximo),
            precioUnitario: Number(i.precio_unitario),
            fechaVencimiento: i.fecha_vencimiento,
            pedidoGenerado: i.pedido_generado,
          })),
          movimientosInventario: movimientos.map((m: any) => ({
            id: m.id,
            insumoId: m.insumo,
            insumoNombre: m.insumo_nombre,
            finca: m.finca_nombre,
            fincaId: m.finca,
            tipo: m.tipo,
            cantidad: m.cantidad,
            fecha: m.fecha,
            responsable: m.responsable_nombre,
            observaciones: m.observaciones,
          })),
          alertas: alertas.map((a: any) => ({
            id: a.id,
            tipo: a.tipo === 'stock_bajo' ? 'advertencia' : a.tipo === 'pago_pendiente' ? 'info' : a.prioridad === 'alta' || a.prioridad === 'critica' ? 'critico' : 'info',
            modulo: a.tipo === 'stock_bajo' ? 'inventario' : a.tipo === 'pago_pendiente' ? 'nomina' : a.tipo === 'cosecha' ? 'produccion' : 'sistema',
            titulo: a.titulo,
            descripcion: a.mensaje,
            fecha: a.fecha_creacion,
            leida: a.leida,
            finca: a.finca_nombre,
            prioridad: a.prioridad,
            rolesPermitidos: ['administrador', 'gerente', 'supervisor_finca', 'contador_rrhh', 'bodeguero'],
          })),
        }));
        
        console.log('[API] Datos cargados exitosamente');
      } catch (error) {
        console.error('[API] Error cargando datos del backend:', error);
      }
    };
    
    if (state.isAuthenticated) {
      loadAllDataFromBackend();
    }
  }, [state.isAuthenticated]);

  // Los datos de 2024+ ahora vienen del backend - no se generan localmente

  // Mantener sincronizado con localStorage
  useEffect(() => {
    if (state.currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(state.currentUser));
    }
  }, [state.currentUser]);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    console.log('[login] Intentando login con:', email);
    
    try {
      // Intentar login con el backend
      const res = await fetch(`${API_URL}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      console.log('[login] Backend response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('[login] Token recibido, guardando...');
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        
        // Obtener datos del usuario
        const userRes = await fetch(`${API_URL}/usuarios/me/`, {
          headers: { 'Authorization': `Bearer ${data.access}` },
        });
        
        console.log('[login] /me response status:', userRes.status);
        
        if (userRes.ok) {
          const userData = await userRes.json();
          console.log('[login] Usuario cargado desde backend:', userData.email);
          const user: User = {
            id: userData.id,
            email: userData.email,
            nombre: userData.nombre,
            rol: userData.rol,
            fincaAsignada: userData.finca_asignada,
            fincaNombre: userData.finca_nombre,
            telefono: userData.telefono,
            activo: userData.activo,
          };
          
          setState((prev) => ({
            ...prev,
            currentUser: user,
            isAuthenticated: true,
          }));
          
          localStorage.setItem("currentUser", JSON.stringify(user));
          return { success: true };
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.log('[login] Backend error:', errorData);
      }
      
      // Si falla el backend, mostrar error
      console.log('[login] Error de autenticación con el backend');
      return { success: false, message: "Credenciales incorrectas" };
    } catch (error) {
      console.error('[login] Exception:', error);
      return { success: false, message: "Error al conectar con el servidor" };
    }
  };

  const logout = () => {
    setState((prev) => ({
      ...prev,
      currentUser: null,
      isAuthenticated: false,
    }));
    localStorage.removeItem("currentUser");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  const setCurrentUser = (user: User | null) => {
    setState((prev) => ({ ...prev, currentUser: user }));
  };

  const toggleTheme = () => {
    const newTheme = state.theme === "light" ? "dark" : "light";
    setState((prev) => ({ ...prev, theme: newTheme }));
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  // Helper para obtener headers con token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  };

  // Producción functions - con API backend
  const addEnfunde = async (enfunde: Enfunde) => {
    try {
      const res = await fetch(`${API_URL}/enfundes/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          finca: enfunde.fincaId || enfunde.finca,
          fecha: enfunde.fecha,
          semana: enfunde.semana,
          año: enfunde.año,
          color_cinta: enfunde.colorCinta,
          cantidad_enfundes: enfunde.cantidadEnfundes,
          matas_caidas: enfunde.matasCaidas || 0,
          observaciones: enfunde.observaciones || '',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const newEnfunde = {
          id: data.id,
          finca: data.finca_nombre,
          fincaId: data.finca,
          fecha: data.fecha,
          semana: data.semana,
          año: data.año,
          colorCinta: data.color_cinta,
          cantidadEnfundes: data.cantidad_enfundes,
          matasCaidas: data.matas_caidas,
          observaciones: data.observaciones,
        };
        setState((prev) => ({ ...prev, enfundes: [newEnfunde, ...prev.enfundes] }));
        return { success: true };
      }
      throw new Error('Error al crear enfunde');
    } catch (error) {
      console.error('Error creating enfunde:', error);
      throw error;
    }
  };

  const replaceEnfundes = (data: Enfunde[]) => {
    setState((prev) => ({ ...prev, enfundes: data }));
  };

  const addCosecha = async (cosecha: Cosecha) => {
    try {
      const res = await fetch(`${API_URL}/cosechas/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          finca: cosecha.fincaId || cosecha.finca,
          fecha: cosecha.fecha,
          semana: cosecha.semana,
          año: cosecha.año,
          lote: cosecha.lote || 'A',
          cajas_producidas: cosecha.cajasProducidas,
          racimos_recuperados: cosecha.racimosRecuperados || 0,
          peso_promedio: cosecha.pesoPromedio || 0,
          calibracion: cosecha.calibracion || 0,
          manos: cosecha.numeroManos || 0,
          ratio: cosecha.ratio || 0,
          observaciones: cosecha.observaciones || '',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const newCosecha = {
          id: data.id,
          finca: data.finca_nombre,
          fincaId: data.finca,
          fecha: data.fecha,
          semana: data.semana,
          año: data.año,
          lote: data.lote,
          cajasProducidas: data.cajas_producidas,
          racimosRecuperados: data.racimos_recuperados,
          pesoPromedio: Number(data.peso_promedio),
          calibracion: Number(data.calibracion),
          numeroManos: data.manos,
          ratio: Number(data.ratio),
        };
        setState((prev) => ({ ...prev, cosechas: [newCosecha, ...prev.cosechas] }));
        return { success: true };
      }
      throw new Error('Error al crear cosecha');
    } catch (error) {
      console.error('Error creating cosecha:', error);
      throw error;
    }
  };

  const updateEnfunde = async (id: string, enfunde: Partial<Enfunde>) => {
    try {
      const body: any = {};
      if (enfunde.finca) body.finca = enfunde.fincaId || enfunde.finca;
      if (enfunde.colorCinta) body.color_cinta = enfunde.colorCinta;
      if (enfunde.cantidadEnfundes) body.cantidad_enfundes = enfunde.cantidadEnfundes;
      if (enfunde.matasCaidas !== undefined) body.matas_caidas = enfunde.matasCaidas;
      
      const res = await fetch(`${API_URL}/enfundes/${id}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setState((prev) => ({
          ...prev,
          enfundes: prev.enfundes.map((e) => e.id === id ? { ...e, ...enfunde } : e),
        }));
      }
    } catch (error) {
      console.error('Error updating enfunde:', error);
    }
  };

  const deleteEnfunde = async (id: string) => {
    try {
      await fetch(`${API_URL}/enfundes/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      setState((prev) => ({
        ...prev,
        enfundes: prev.enfundes.filter((e) => e.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting enfunde:', error);
    }
  };

  const updateCosecha = async (id: string, cosecha: Partial<Cosecha>) => {
    try {
      const body: any = {};
      if (cosecha.cajasProducidas) body.cajas_producidas = cosecha.cajasProducidas;
      if (cosecha.pesoPromedio) body.peso_promedio = cosecha.pesoPromedio;
      if (cosecha.ratio) body.ratio = cosecha.ratio;
      
      const res = await fetch(`${API_URL}/cosechas/${id}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setState((prev) => ({
          ...prev,
          cosechas: prev.cosechas.map((c) => c.id === id ? { ...c, ...cosecha } : c),
        }));
      }
    } catch (error) {
      console.error('Error updating cosecha:', error);
    }
  };

  const deleteCosecha = async (id: string) => {
    try {
      await fetch(`${API_URL}/cosechas/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      setState((prev) => ({
        ...prev,
        cosechas: prev.cosechas.filter((c) => c.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting cosecha:', error);
    }
  };

  const addRecuperacionCinta = async (recuperacion: RecuperacionCinta) => {
    try {
      const res = await fetch(`${API_URL}/recuperaciones/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          enfunde: recuperacion.enfundeId,
          fecha: recuperacion.fecha,
          cintas_recuperadas: recuperacion.cintasRecuperadas,
          porcentaje_recuperacion: recuperacion.porcentajeRecuperacion,
          observaciones: recuperacion.observaciones || '',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setState((prev) => ({
          ...prev,
          recuperacionCintas: [{
            id: data.id,
            enfundeId: data.enfunde,
            fincaNombre: data.finca_nombre,
            fecha: data.fecha,
            cintasRecuperadas: data.cintas_recuperadas,
            porcentajeRecuperacion: Number(data.porcentaje_recuperacion),
            observaciones: data.observaciones,
          }, ...prev.recuperacionCintas],
        }));
      }
    } catch (error) {
      console.error('Error creating recuperacion:', error);
    }
  };

  const updateRecuperacionCinta = (id: string, recuperacion: Partial<RecuperacionCinta>) => {
    setState((prev) => ({
      ...prev,
      recuperacionCintas: prev.recuperacionCintas.map((r) =>
        r.id === id ? { ...r, ...recuperacion } : r
      ),
    }));
  };

  const deleteRecuperacionCinta = async (id: string) => {
    try {
      await fetch(`${API_URL}/recuperaciones/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      setState((prev) => ({
        ...prev,
        recuperacionCintas: prev.recuperacionCintas.filter((r) => r.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting recuperacion:', error);
    }
  };

  // Nómina functions - con API backend
  const addEmpleado = async (empleado: Empleado) => {
    try {
      const res = await fetch(`${API_URL}/empleados/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          finca: empleado.fincaId || empleado.finca,
          nombre: empleado.nombre,
          cedula: empleado.cedula,
          cargo: empleado.cargo || empleado.labor,
          salario_base: empleado.salarioBase || empleado.tarifaDiaria || 0,
          fecha_ingreso: empleado.fechaIngreso,
          telefono: empleado.telefono || '',
          direccion: empleado.direccion || '',
          activo: empleado.activo ?? true,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setState((prev) => ({ ...prev, empleados: [{
          id: data.id,
          finca: data.finca_nombre,
          fincaId: data.finca,
          nombre: data.nombre,
          cedula: data.cedula,
          cargo: data.cargo,
          labor: data.cargo,
          salarioBase: Number(data.salario_base),
          tarifaDiaria: Number(data.salario_base),
          fechaIngreso: data.fecha_ingreso,
          telefono: data.telefono,
          direccion: data.direccion,
          activo: data.activo,
        }, ...prev.empleados] }));
        return { success: true };
      }
      throw new Error('Error al crear empleado');
    } catch (error) {
      console.error('Error creating empleado:', error);
      throw error;
    }
  };

  const updateEmpleado = async (id: string, empleado: Partial<Empleado>) => {
    try {
      const body: any = {};
      if (empleado.nombre) body.nombre = empleado.nombre;
      if (empleado.cargo || empleado.labor) body.cargo = empleado.cargo || empleado.labor;
      if (empleado.salarioBase || empleado.tarifaDiaria) body.salario_base = empleado.salarioBase || empleado.tarifaDiaria;
      if (empleado.telefono !== undefined) body.telefono = empleado.telefono;
      if (empleado.activo !== undefined) body.activo = empleado.activo;
      
      await fetch(`${API_URL}/empleados/${id}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      setState((prev) => ({
        ...prev,
        empleados: prev.empleados.map((e) => e.id === id ? { ...e, ...empleado } : e),
      }));
    } catch (error) {
      console.error('Error updating empleado:', error);
    }
  };

  const deleteEmpleado = async (id: string) => {
    try {
      await fetch(`${API_URL}/empleados/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      setState((prev) => ({
        ...prev,
        empleados: prev.empleados.filter((e) => e.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting empleado:', error);
    }
  };

  const addRolPago = async (rol: RolPago) => {
    try {
      const res = await fetch(`${API_URL}/roles-pago/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          empleado: rol.empleadoId,
          fecha_pago: rol.fechaPago,
          periodo_inicio: rol.periodoInicio,
          periodo_fin: rol.periodoFin,
          salario_base: rol.salarioBase,
          horas_extras: rol.horasExtras || 0,
          bonificaciones: rol.bonificaciones || 0,
          deducciones: rol.deducciones || 0,
          total_pagar: rol.netoAPagar || rol.totalIngresos,
          estado: rol.estado || 'pendiente',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setState((prev) => ({ ...prev, rolesPago: [{
          id: data.id,
          empleadoId: data.empleado,
          empleadoNombre: data.empleado_nombre,
          finca: data.finca_nombre,
          fincaNombre: data.finca_nombre,
          fechaPago: data.fecha_pago,
          periodoInicio: data.periodo_inicio,
          periodoFin: data.periodo_fin,
          salarioBase: Number(data.salario_base),
          horasExtras: Number(data.horas_extras),
          bonificaciones: Number(data.bonificaciones),
          deducciones: Number(data.deducciones),
          totalIngresos: Number(data.salario_base) + Number(data.horas_extras) + Number(data.bonificaciones),
          totalEgresos: Number(data.deducciones),
          netoAPagar: Number(data.total_pagar),
          estado: data.estado,
        }, ...prev.rolesPago] }));
      }
    } catch (error) {
      console.error('Error creating rol pago:', error);
    }
  };

  const addPrestamo = async (prestamo: Prestamo) => {
    try {
      const res = await fetch(`${API_URL}/prestamos/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          empleado: prestamo.empleadoId,
          monto: prestamo.monto,
          cuotas: prestamo.cuotas || prestamo.numeroCuotas,
          fecha_solicitud: prestamo.fechaSolicitud,
          estado: prestamo.estado || 'pendiente',
          motivo: prestamo.motivo || '',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setState((prev) => ({ ...prev, prestamos: [{
          id: data.id,
          empleadoId: data.empleado,
          empleadoNombre: data.empleado_nombre,
          fincaNombre: data.finca_nombre,
          monto: Number(data.monto),
          montoPagado: Number(data.monto_pagado),
          saldoPendiente: Number(data.saldo_pendiente),
          cuotas: data.cuotas,
          numeroCuotas: data.cuotas,
          cuotasPagadas: data.cuotas_pagadas,
          valorCuota: Number(data.monto) / data.cuotas,
          fechaSolicitud: data.fecha_solicitud,
          estado: data.estado,
          motivo: data.motivo,
        }, ...prev.prestamos] }));
      }
    } catch (error) {
      console.error('Error creating prestamo:', error);
    }
  };

  const updatePrestamo = async (id: string, prestamo: Partial<Prestamo>) => {
    try {
      const body: any = {};
      if (prestamo.estado) body.estado = prestamo.estado;
      if (prestamo.cuotasPagadas !== undefined) body.cuotas_pagadas = prestamo.cuotasPagadas;
      
      await fetch(`${API_URL}/prestamos/${id}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      setState((prev) => ({
        ...prev,
        prestamos: prev.prestamos.map((p) => p.id === id ? { ...p, ...prestamo } : p),
      }));
    } catch (error) {
      console.error('Error updating prestamo:', error);
    }
  };

  const updateRolPagoEstado = (id: string, estado: "pendiente" | "pagado") => {
    setState((prev) => {
      const rol = prev.rolesPago.find((r) => r.id === id);
      if (!rol) {
        return prev;
      }
      let newPrestamos = [...prev.prestamos];
      let newRoles = prev.rolesPago.map((r) => (r.id === id ? { ...r, estado } : r));

      if (estado === "pagado") {
        if (!rol.prestamoAplicado) {
          const prestamosEmpleado = prev.prestamos.filter((x) => x.empleadoId === rol.empleadoId && x.saldoPendiente > 0);
          if (prestamosEmpleado.length) {
            let totalDesc = 0;
            const updates: Record<string, Prestamo> = {} as any;
            for (const p of prestamosEmpleado) {
              if (p.estado !== "activo") continue;
              const valorCuota = p.valorCuota || 0;
              const cuotasPagadas = p.cuotasPagadas || 0;
              const numeroCuotas = p.numeroCuotas || p.cuotas || 1;
              const desc = Math.min(valorCuota, p.saldoPendiente);
              totalDesc += desc;
              updates[p.id] = {
                ...p,
                cuotasPagadas: cuotasPagadas + 1,
                saldoPendiente: Math.max(0, p.saldoPendiente - desc),
                estado: cuotasPagadas + 1 >= numeroCuotas || p.saldoPendiente - desc <= 0 ? "finalizado" : "activo",
              };
            }
            newPrestamos = prev.prestamos.map((x) => (updates[x.id] ? updates[x.id] : x));
            newRoles = prev.rolesPago.map((r) =>
              r.id === id
                ? {
                    ...r,
                    prestamos: Number(totalDesc.toFixed(2)),
                    totalEgresos: Number(((r.iess || 0) + (r.multas || 0) + totalDesc).toFixed(2)),
                    netoAPagar: Number(((r.totalIngresos || 0) - ((r.iess || 0) + (r.multas || 0) + totalDesc)).toFixed(2)),
                    prestamoAplicado: true,
                    estado: "pagado",
                  }
                : r
            );
          }
        }
      } else if (estado === "pendiente") {
        if (rol.prestamoAplicado) {
          let remaining = rol.prestamos || 0;
          const prestamosEmpleado = prev.prestamos.filter((x) => x.empleadoId === rol.empleadoId);
          const updates: Record<string, Prestamo> = {} as any;
          for (const p of prestamosEmpleado) {
            if (remaining <= 0) break;
            const revertAmount = Math.min(p.valorCuota || 0, remaining);
            const cuotasPagadas = Math.max(0, (p.cuotasPagadas || 0) - 1);
            const saldoPendiente = p.saldoPendiente + revertAmount;
            updates[p.id] = {
              ...p,
              cuotasPagadas,
              saldoPendiente,
              estado: "activo",
            };
            remaining = Number((remaining - revertAmount).toFixed(2));
          }
          newPrestamos = prev.prestamos.map((x) => (updates[x.id] ? updates[x.id] : x));
          newRoles = prev.rolesPago.map((r) =>
            r.id === id
              ? {
                  ...r,
                  prestamoAplicado: false,
                  estado: "pendiente",
                }
              : r
          );
        }
      }

      return { ...prev, rolesPago: newRoles, prestamos: newPrestamos };
    });
  };

  // Inventario functions - con API backend
  const addInsumo = async (insumo: Insumo) => {
    try {
      const res = await fetch(`${API_URL}/insumos/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          finca: insumo.fincaId || insumo.finca,
          nombre: insumo.nombre,
          categoria: insumo.categoria,
          proveedor: insumo.proveedor || '',
          unidad_medida: insumo.unidadMedida,
          stock_actual: insumo.stockActual,
          stock_minimo: insumo.stockMinimo,
          stock_maximo: insumo.stockMaximo || 1000,
          precio_unitario: insumo.precioUnitario || 0,
          fecha_vencimiento: insumo.fechaVencimiento || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setState((prev) => ({ ...prev, insumos: [{
          id: data.id,
          finca: data.finca_nombre,
          fincaId: data.finca,
          nombre: data.nombre,
          categoria: data.categoria,
          proveedor: data.proveedor,
          unidadMedida: data.unidad_medida,
          stockActual: Number(data.stock_actual),
          stockMinimo: Number(data.stock_minimo),
          stockMaximo: Number(data.stock_maximo),
          precioUnitario: Number(data.precio_unitario),
          fechaVencimiento: data.fecha_vencimiento,
          pedidoGenerado: data.pedido_generado,
        }, ...prev.insumos] }));
        return { success: true };
      }
      throw new Error('Error al crear insumo');
    } catch (error) {
      console.error('Error creating insumo:', error);
      throw error;
    }
  };

  const updateInsumo = async (id: string, insumo: Partial<Insumo>) => {
    try {
      const body: any = {};
      if (insumo.nombre) body.nombre = insumo.nombre;
      if (insumo.stockActual !== undefined) body.stock_actual = insumo.stockActual;
      if (insumo.stockMinimo !== undefined) body.stock_minimo = insumo.stockMinimo;
      if (insumo.precioUnitario !== undefined) body.precio_unitario = insumo.precioUnitario;
      if (insumo.pedidoGenerado !== undefined) body.pedido_generado = insumo.pedidoGenerado;
      
      await fetch(`${API_URL}/insumos/${id}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      setState((prev) => ({
        ...prev,
        insumos: prev.insumos.map((i) => (i.id === id ? { ...i, ...insumo } : i)),
      }));
    } catch (error) {
      console.error('Error updating insumo:', error);
    }
  };

  const addMovimientoInventario = async (movimiento: MovimientoInventario) => {
    try {
      const res = await fetch(`${API_URL}/movimientos-inventario/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          insumo: movimiento.insumoId,
          finca: movimiento.fincaId || movimiento.finca,
          tipo: movimiento.tipo,
          cantidad: movimiento.cantidad,
          fecha: movimiento.fecha,
          observaciones: movimiento.observaciones || '',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const newMov = {
          id: data.id,
          insumoId: data.insumo,
          insumoNombre: data.insumo_nombre,
          finca: data.finca_nombre,
          fincaId: data.finca,
          tipo: data.tipo,
          cantidad: data.cantidad,
          fecha: data.fecha,
          responsable: data.responsable_nombre,
          observaciones: data.observaciones,
        };
        
        setState((prev) => {
          const insumo = prev.insumos.find((i) => i.id === movimiento.insumoId);
          if (insumo) {
            const newStock = movimiento.tipo === "entrada"
              ? insumo.stockActual + movimiento.cantidad
              : insumo.stockActual - movimiento.cantidad;
            return {
              ...prev,
              movimientosInventario: [newMov, ...prev.movimientosInventario],
              insumos: prev.insumos.map((i) => i.id === movimiento.insumoId ? { ...i, stockActual: newStock } : i),
            };
          }
          return { ...prev, movimientosInventario: [newMov, ...prev.movimientosInventario] };
        });
      }
    } catch (error) {
      console.error('Error creating movimiento:', error);
    }
  };

  // Generar orden de compra para un insumo y manejar alertas asociadas
  const generarOrdenCompra = (insumoId: string) => {
    setState((prev) => {
      const insumo = prev.insumos.find((i) => i.id === insumoId);
      const newInsumos = prev.insumos.map((i) =>
        i.id === insumoId ? { ...i, pedidoGenerado: true } : i
      );

      const infoAlert: Alerta = {
        id: `inv-orden-${insumoId}-${Date.now()}`,
        tipo: "info",
        modulo: "inventario",
        titulo: "Orden de compra generada",
        descripcion: insumo
          ? `${insumo.nombre} - pedido enviado`
          : `Insumo ${insumoId} - pedido enviado`,
        fecha: new Date().toISOString(),
        leida: false,
        accionRequerida: "Seguimiento de compra",
        rolesPermitidos: [
          "administrador",
          "gerente",
          "supervisor_finca",
          "contador_rrhh",
          "bodeguero",
        ],
        metadata: { insumoId },
      };

      const alertasActualizadas = prev.alertas.map((a) =>
        a.id === `inv-stock-${insumoId}` ? { ...a, leida: true } : a
      );

      return {
        ...prev,
        insumos: newInsumos,
        alertas: [infoAlert, ...alertasActualizadas],
      };
    });
  };

  // Alertas functions
  const addAlerta = (alerta: Alerta) => {
    setState((prev) => ({ ...prev, alertas: [alerta, ...prev.alertas] }));
  };

  const marcarAlertaLeida = (id: string) => {
    setState((prev) => ({
      ...prev,
      alertas: prev.alertas.map((a) =>
        a.id === id ? { ...a, leida: true } : a
      ),
    }));
  };

  // Motor de alertas de inventario: sincroniza alertas automáticas según stock
  useEffect(() => {
    setState((prev) => {
      // Mantener otras alertas que no sean de inventario derivadas
      const baseAlertas = prev.alertas.filter(
        (a) =>
          !(
            a.modulo === "inventario" &&
            (a.titulo.startsWith("Stock") || a.titulo.startsWith("Caducidad"))
          )
      );

      // Derivar alertas por stock bajo/crítico para insumos sin pedido
      const derivedStock = prev.insumos
        .filter((i) => i.stockActual < i.stockMinimo && !i.pedidoGenerado)
        .map((i) => {
          const critico = i.stockActual < i.stockMinimo * 0.5;
          const titulo = critico ? "Stock Crítico" : "Stock Bajo";
          const tipo: Alerta["tipo"] = critico ? "critico" : "advertencia";
          const id = `inv-stock-${i.id}`;
          const existing = prev.alertas.find((a) => a.id === id);
          return {
            id,
            tipo,
            modulo: "inventario",
            titulo,
            descripcion: `${i.nombre} - Stock ${i.stockActual} ${i.unidadMedida} / Mínimo ${i.stockMinimo} ${i.unidadMedida}`,
            fecha: new Date().toISOString(),
            leida: existing?.leida ?? false,
            finca: i.finca,
            rolesPermitidos: [
              "administrador",
              "gerente",
              "supervisor_finca",
              "contador_rrhh",
              "bodeguero",
            ],
            metadata: {
              insumoId: i.id,
              tipo: "stock_bajo",
              cantidad: String(i.stockActual),
              minimo: String(i.stockMinimo),
              producto: i.nombre,
              unidadMedida: i.unidadMedida,
            },
          } as Alerta;
        });

      // Derivar alertas por caducidad próxima
      const hoy = new Date();
      const diasRestantes = (fStr?: string) => {
        if (!fStr) return Infinity;
        const fv = new Date(fStr);
        return Math.ceil((fv.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      };
      const derivedCaducidad = prev.insumos
        .map((i) => {
          const dr = diasRestantes(i.fechaVencimiento);
          return { insumo: i, dr };
        })
        .filter(({ dr }) => dr <= 15)
        .map(({ insumo, dr }) => {
          const critico = dr <= 7;
          const titulo = "Caducidad Próxima";
          const tipo: Alerta["tipo"] = critico ? "critico" : "advertencia";
          const id = `inv-cad-${insumo.id}`;
          const existing = prev.alertas.find((a) => a.id === id);
          return {
            id,
            tipo,
            modulo: "inventario",
            titulo,
            descripcion: `${insumo.nombre} - ${dr} días para vencer`,
            fecha: new Date().toISOString(),
            leida: existing?.leida ?? false,
            finca: insumo.finca,
            rolesPermitidos: [
              "administrador",
              "gerente",
              "supervisor_finca",
              "contador_rrhh",
              "bodeguero",
            ],
            metadata: {
              insumoId: insumo.id,
              tipo: "caducidad",
              diasRestantes: String(dr),
              producto: insumo.nombre,
              unidadMedida: insumo.unidadMedida,
            },
          } as Alerta;
        });

      return { ...prev, alertas: [...derivedStock, ...derivedCaducidad, ...baseAlertas] };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.insumos]);

  // Configuración functions - con API backend
  const addFinca = async (finca: Finca) => {
    try {
      const res = await fetch(`${API_URL}/fincas/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          nombre: finca.nombre,
          ubicacion: finca.ubicacion || '',
          hectareas: finca.hectareas || 0,
          responsable: finca.responsable || '',
          telefono: finca.telefono || '',
          activa: true,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setState((prev) => ({ ...prev, fincas: [...prev.fincas, {
          id: data.id,
          nombre: data.nombre,
          ubicacion: data.ubicacion,
          hectareas: Number(data.hectareas),
          responsable: data.responsable,
          activa: data.activa,
        }] }));
        return { success: true };
      }
      throw new Error('Error al crear finca');
    } catch (error) {
      console.error('Error creating finca:', error);
      throw error;
    }
  };

  const updateFinca = async (id: string, finca: Partial<Finca>) => {
    try {
      const body: any = {};
      if (finca.nombre) body.nombre = finca.nombre;
      if (finca.ubicacion !== undefined) body.ubicacion = finca.ubicacion;
      if (finca.hectareas !== undefined) body.hectareas = finca.hectareas;
      if (finca.responsable !== undefined) body.responsable = finca.responsable;
      
      await fetch(`${API_URL}/fincas/${id}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      setState((prev) => ({
        ...prev,
        fincas: prev.fincas.map((f) => (f.id === id ? { ...f, ...finca } : f)),
      }));
    } catch (error) {
      console.error('Error updating finca:', error);
    }
  };

  const deleteFinca = async (id: string) => {
    try {
      await fetch(`${API_URL}/fincas/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      setState((prev) => ({
        ...prev,
        fincas: prev.fincas.filter((f) => f.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting finca:', error);
    }
  };

  const addUsuario = async (usuario: User) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/usuarios/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          email: usuario.email,
          nombre: usuario.nombre,
          password: usuario.password || '123456',
          rol: usuario.rol,
          finca_asignada: usuario.fincaAsignada || null,
          telefono: usuario.telefono || '',
          activo: usuario.activo ?? true,
        }),
      });
      
      if (res.ok) {
        const newUser = await res.json();
        setState((prev) => ({ 
          ...prev, 
          usuarios: [...prev.usuarios, {
            id: newUser.id,
            email: newUser.email,
            nombre: newUser.nombre,
            rol: newUser.rol,
            fincaAsignada: newUser.finca_asignada,
            telefono: newUser.telefono,
            activo: newUser.activo,
          }] 
        }));
        return { success: true };
      } else {
        const error = await res.json();
        console.error('Error creating user:', error);
        return { success: false, error };
      }
    } catch (error) {
      console.error('Error creating user:', error);
      // Fallback to local state
      setState((prev) => ({ ...prev, usuarios: [...prev.usuarios, usuario] }));
      return { success: false };
    }
  };

  const updateUsuario = async (id: string, usuario: Partial<User>) => {
    const token = localStorage.getItem('accessToken');
    
    console.log('[updateUsuario] Token exists:', !!token, token ? token.substring(0, 20) + '...' : 'NO TOKEN');
    
    if (!token) {
      console.error('[updateUsuario] No hay token JWT. Debes iniciar sesión con el backend.');
      // Solo actualizar local state
      setState((prev) => ({
        ...prev,
        usuarios: prev.usuarios.map((u) =>
          String(u.id) === String(id) ? { ...u, ...usuario } : u
        ),
      }));
      return { success: false, error: 'No hay token JWT' };
    }
    
    const body: any = {};
    if (usuario.email !== undefined) body.email = usuario.email;
    if (usuario.nombre !== undefined) body.nombre = usuario.nombre;
    if (usuario.password !== undefined && usuario.password !== '') body.password = usuario.password;
    if (usuario.rol !== undefined) body.rol = usuario.rol;
    if (usuario.fincaAsignada !== undefined) body.finca_asignada = usuario.fincaAsignada || null;
    if (usuario.telefono !== undefined) body.telefono = usuario.telefono;
    if (usuario.activo !== undefined) body.activo = usuario.activo;
    
    console.log('[updateUsuario] ID:', id, 'Body:', body);
    
    try {
      const res = await fetch(`${API_URL}/usuarios/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      
      console.log('[updateUsuario] Response status:', res.status);
      
      if (res.ok) {
        const updatedUser = await res.json();
        console.log('[updateUsuario] Success:', updatedUser);
        setState((prev) => ({
          ...prev,
          usuarios: prev.usuarios.map((u) =>
            String(u.id) === String(id) ? { 
              ...u, 
              email: updatedUser.email,
              nombre: updatedUser.nombre,
              rol: updatedUser.rol,
              fincaAsignada: updatedUser.finca_asignada,
              telefono: updatedUser.telefono,
              activo: updatedUser.activo,
            } : u
          ),
        }));
        return { success: true };
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('[updateUsuario] Error response:', res.status, errorData);
      }
    } catch (error) {
      console.error('[updateUsuario] Exception:', error);
    }
    
    // Fallback to local state only
    setState((prev) => ({
      ...prev,
      usuarios: prev.usuarios.map((u) =>
        String(u.id) === String(id) ? { ...u, ...usuario } : u
      ),
    }));
    return { success: false };
  };

  const deleteUsuario = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/usuarios/${id}/`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      
      if (res.ok || res.status === 204) {
        setState((prev) => ({
          ...prev,
          usuarios: prev.usuarios.filter((u) => u.id !== id),
        }));
        return { success: true };
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
    // Fallback to local state
    setState((prev) => ({
      ...prev,
      usuarios: prev.usuarios.filter((u) => u.id !== id),
    }));
  };

  const value: AppContextType = {
    state,
    setCurrentUser,
    login,
    logout,
    toggleTheme,
    addEnfunde,
    replaceEnfundes,
    addCosecha,
    updateEnfunde,
    updateCosecha,
    deleteEnfunde,
    deleteCosecha,
    addRecuperacionCinta,
    updateRecuperacionCinta,
    deleteRecuperacionCinta,
    addEmpleado,
    updateEmpleado,
    deleteEmpleado,
    addRolPago,
    addPrestamo,
    updatePrestamo,
    updateRolPagoEstado,
    addInsumo,
    updateInsumo,
    addMovimientoInventario,
    generarOrdenCompra,
    addAlerta,
    marcarAlertaLeida,
    addFinca,
    updateFinca,
    deleteFinca,
    addUsuario,
    updateUsuario,
    deleteUsuario,
    canAccess: (resource, action = "view") => {
      const role: UserRole | undefined = state.currentUser?.rol;
      if (!role) return false;
      const PERMISSIONS: Record<
        "dashboard" | "produccion" | "nomina" | "inventario" | "reportes" | "configuracion" | "analytics" | "geovisualizacion",
        Record<UserRole, { view: boolean; edit: boolean }>
      > = {
        dashboard: {
          administrador: { view: true, edit: true },
          gerente: { view: true, edit: false },
          supervisor_finca: { view: true, edit: false },
          contador_rrhh: { view: true, edit: false },
          bodeguero: { view: true, edit: false },
        },
        produccion: {
          administrador: { view: true, edit: true },
          gerente: { view: true, edit: false },
          supervisor_finca: { view: true, edit: true },
          contador_rrhh: { view: false, edit: false },
          bodeguero: { view: false, edit: false },
        },
        nomina: {
          administrador: { view: true, edit: true },
          gerente: { view: true, edit: false },
          supervisor_finca: { view: false, edit: false },
          contador_rrhh: { view: true, edit: true },
          bodeguero: { view: false, edit: false },
        },
        inventario: {
          administrador: { view: true, edit: true },
          gerente: { view: true, edit: false },
          supervisor_finca: { view: true, edit: true },
          contador_rrhh: { view: false, edit: false },
          bodeguero: { view: true, edit: true },
        },
        reportes: {
          administrador: { view: true, edit: true },
          gerente: { view: true, edit: true },
          supervisor_finca: { view: true, edit: false },
          contador_rrhh: { view: true, edit: true },
          bodeguero: { view: true, edit: true },
        },
        analytics: {
          administrador: { view: true, edit: true },
          gerente: { view: true, edit: true },
          supervisor_finca: { view: true, edit: false },
          contador_rrhh: { view: true, edit: false },
          bodeguero: { view: false, edit: false },
        },
        geovisualizacion: {
          administrador: { view: true, edit: true },
          gerente: { view: true, edit: false },
          supervisor_finca: { view: true, edit: false },
          contador_rrhh: { view: false, edit: false },
          bodeguero: { view: false, edit: false },
        },
        configuracion: {
          administrador: { view: true, edit: true },
          gerente: { view: false, edit: false },
          supervisor_finca: { view: false, edit: false },
          contador_rrhh: { view: false, edit: false },
          bodeguero: { view: false, edit: false },
        },
      };
      return PERMISSIONS[resource][role][action];
    },

    // Filtered data getters
    getFilteredEnfundes: () => {
      const user = state.currentUser;
      if (!user || user.rol === 'administrador' || user.rol === 'gerente') {
        return state.enfundes;
      }
      if (user.fincaAsignada) {
        const finca = state.fincas.find(f => f.id === user.fincaAsignada);
        const fincaNombre = finca?.nombre;
        return state.enfundes.filter(e => e.finca === fincaNombre || e.fincaId === user.fincaAsignada);
      }
      return state.enfundes;
    },
    getFilteredCosechas: () => {
      const user = state.currentUser;
      if (!user || user.rol === 'administrador' || user.rol === 'gerente') {
        return state.cosechas;
      }
      if (user.fincaAsignada) {
        const finca = state.fincas.find(f => f.id === user.fincaAsignada);
        const fincaNombre = finca?.nombre;
        return state.cosechas.filter(c => c.finca === fincaNombre || c.fincaId === user.fincaAsignada);
      }
      return state.cosechas;
    },
    getFilteredRecuperaciones: () => {
      const user = state.currentUser;
      if (!user || user.rol === 'administrador' || user.rol === 'gerente') {
        return state.recuperacionCintas;
      }
      if (user.fincaAsignada) {
        const finca = state.fincas.find(f => f.id === user.fincaAsignada);
        const fincaNombre = finca?.nombre;
        return state.recuperacionCintas.filter(r => r.finca === fincaNombre || r.fincaNombre === fincaNombre);
      }
      return state.recuperacionCintas;
    },
    getFilteredEmpleados: () => {
      const user = state.currentUser;
      if (!user || user.rol === 'administrador' || user.rol === 'gerente' || user.rol === 'contador_rrhh') {
        return state.empleados;
      }
      if (user.fincaAsignada) {
        const finca = state.fincas.find(f => f.id === user.fincaAsignada);
        const fincaNombre = finca?.nombre;
        return state.empleados.filter(e => e.finca === fincaNombre || e.fincaId === user.fincaAsignada);
      }
      return state.empleados;
    },
    getFilteredRolesPago: () => {
      const user = state.currentUser;
      if (!user || user.rol === 'administrador' || user.rol === 'gerente' || user.rol === 'contador_rrhh') {
        return state.rolesPago;
      }
      if (user.fincaAsignada) {
        const finca = state.fincas.find(f => f.id === user.fincaAsignada);
        const fincaNombre = finca?.nombre;
        return state.rolesPago.filter(r => r.finca === fincaNombre || r.fincaNombre === fincaNombre);
      }
      return state.rolesPago;
    },
    getFilteredPrestamos: () => {
      const user = state.currentUser;
      if (!user || user.rol === 'administrador' || user.rol === 'gerente' || user.rol === 'contador_rrhh') {
        return state.prestamos;
      }
      if (user.fincaAsignada) {
        const finca = state.fincas.find(f => f.id === user.fincaAsignada);
        const fincaNombre = finca?.nombre;
        return state.prestamos.filter(p => p.fincaNombre === fincaNombre);
      }
      return state.prestamos;
    },
    getFilteredInsumos: () => {
      const user = state.currentUser;
      if (!user || user.rol === 'administrador' || user.rol === 'gerente') {
        return state.insumos;
      }
      if (user.fincaAsignada) {
        const finca = state.fincas.find(f => f.id === user.fincaAsignada);
        const fincaNombre = finca?.nombre;
        return state.insumos.filter(i => i.finca === fincaNombre || i.fincaId === user.fincaAsignada);
      }
      return state.insumos;
    },
    getFilteredMovimientos: () => {
      const user = state.currentUser;
      if (!user || user.rol === 'administrador' || user.rol === 'gerente') {
        return state.movimientosInventario;
      }
      if (user.fincaAsignada) {
        const finca = state.fincas.find(f => f.id === user.fincaAsignada);
        const fincaNombre = finca?.nombre;
        return state.movimientosInventario.filter(m => m.finca === fincaNombre || m.fincaId === user.fincaAsignada);
      }
      return state.movimientosInventario;
    },

    // Direct access helpers
    currentUser: state.currentUser,
    enfundes: state.enfundes,
    cosechas: state.cosechas,
    empleados: state.empleados,
    rolesPago: state.rolesPago,
    prestamos: state.prestamos,
    insumos: state.insumos,
    movimientosInventario: state.movimientosInventario,
    alertas: state.alertas,
    fincas: state.fincas,
    usuarios: state.usuarios,
    recuperacionCintas: state.recuperacionCintas,
  };

  // No renderizar hasta que esté inicializado
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }

  // Verificar localStorage como fallback para isAuthenticated
  const isAuthenticated =
    context.state.isAuthenticated || !!localStorage.getItem("currentUser");

  return {
    ...context.state,
    isAuthenticated, // Sobrescribir con la verificación mejorada
    ...context,
  };
}
