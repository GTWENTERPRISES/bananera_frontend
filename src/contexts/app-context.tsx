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
import {
  mockUsers,
  mockEnfundes,
  mockCosechas,
  mockEmpleados,
  mockRolesPago,
  mockPrestamos,
  mockInsumos,
  mockMovimientosInventario,
  mockAlertas,
  mockRecuperacionCintas,
  mockFincas,
} from "@/src/lib/mock-data";
import { Loader2 } from "lucide-react";

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
  addEnfunde: (enfunde: Enfunde) => void;
  addCosecha: (cosecha: Cosecha) => void;
  updateEnfunde: (id: string, enfunde: Partial<Enfunde>) => void;
  updateCosecha: (id: string, cosecha: Partial<Cosecha>) => void;
  addRecuperacionCinta: (recuperacion: RecuperacionCinta) => void;

  // Nómina
  addEmpleado: (empleado: Empleado) => void;
  updateEmpleado: (id: string, empleado: Partial<Empleado>) => void;
  addRolPago: (rol: RolPago) => void;
  addPrestamo: (prestamo: Prestamo) => void;
  updatePrestamo: (id: string, prestamo: Partial<Prestamo>) => void;
  updateRolPagoEstado: (id: string, estado: "pendiente" | "pagado") => void;

  // Inventario
  addInsumo: (insumo: Insumo) => void;
  updateInsumo: (id: string, insumo: Partial<Insumo>) => void;
  addMovimientoInventario: (movimiento: MovimientoInventario) => void;

  // Alertas
  addAlerta: (alerta: Alerta) => void;
  marcarAlertaLeida: (id: string) => void;

  // Configuración
  addFinca: (finca: Finca) => void;
  updateFinca: (id: string, finca: Partial<Finca>) => void;
  deleteFinca: (id: string) => void;
  addUsuario: (usuario: User) => void;
  updateUsuario: (id: string, usuario: Partial<User>) => void;
  deleteUsuario: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    isAuthenticated: false,
    theme: "light",
    enfundes: mockEnfundes,
    cosechas: mockCosechas,
    recuperacionCintas: mockRecuperacionCintas,
    empleados: mockEmpleados,
    rolesPago: mockRolesPago,
    prestamos: mockPrestamos,
    insumos: mockInsumos,
    movimientosInventario: mockMovimientosInventario,
    alertas: mockAlertas,
    fincas: mockFincas,
    usuarios: mockUsers,
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
    try {
      const user = mockUsers.find(
        (u) => u.email === email && u.password === password
      );

      if (!user) {
        return { success: false, message: "Credenciales incorrectas" };
      }

      if (!user.activo) {
        return {
          success: false,
          message: "Usuario inactivo. Contacte al administrador",
        };
      }

      // Guardar en estado y localStorage
      setState((prev) => ({
        ...prev,
        currentUser: user,
        isAuthenticated: true,
      }));

      localStorage.setItem("currentUser", JSON.stringify(user));

      return { success: true };
    } catch (error) {
      return { success: false, message: "Error al iniciar sesión" };
    }
  };

  const logout = () => {
    setState((prev) => ({
      ...prev,
      currentUser: null,
      isAuthenticated: false,
    }));
    localStorage.removeItem("currentUser");
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

  // Producción functions
  const addEnfunde = (enfunde: Enfunde) => {
    setState((prev) => ({ ...prev, enfundes: [...prev.enfundes, enfunde] }));
  };

  const addCosecha = (cosecha: Cosecha) => {
    setState((prev) => ({ ...prev, cosechas: [...prev.cosechas, cosecha] }));
  };

  const updateEnfunde = (id: string, enfunde: Partial<Enfunde>) => {
    setState((prev) => ({
      ...prev,
      enfundes: prev.enfundes.map((e) =>
        e.id === id ? { ...e, ...enfunde } : e
      ),
    }));
  };

  const updateCosecha = (id: string, cosecha: Partial<Cosecha>) => {
    setState((prev) => ({
      ...prev,
      cosechas: prev.cosechas.map((c) =>
        c.id === id ? { ...c, ...cosecha } : c
      ),
    }));
  };

  const addRecuperacionCinta = (recuperacion: RecuperacionCinta) => {
    setState((prev) => ({
      ...prev,
      recuperacionCintas: [...prev.recuperacionCintas, recuperacion],
    }));
  };

  // Nómina functions
  const addEmpleado = (empleado: Empleado) => {
    setState((prev) => ({ ...prev, empleados: [...prev.empleados, empleado] }));
  };

  const updateEmpleado = (id: string, empleado: Partial<Empleado>) => {
    setState((prev) => ({
      ...prev,
      empleados: prev.empleados.map((e) =>
        e.id === id ? { ...e, ...empleado } : e
      ),
    }));
  };

  const addRolPago = (rol: RolPago) => {
    setState((prev) => ({ ...prev, rolesPago: [...prev.rolesPago, rol] }));
  };

  const addPrestamo = (prestamo: Prestamo) => {
    setState((prev) => ({ ...prev, prestamos: [...prev.prestamos, prestamo] }));
  };

  const updatePrestamo = (id: string, prestamo: Partial<Prestamo>) => {
    setState((prev) => ({
      ...prev,
      prestamos: prev.prestamos.map((p) =>
        p.id === id ? { ...p, ...prestamo } : p
      ),
    }));
  };

  const updateRolPagoEstado = (id: string, estado: "pendiente" | "pagado") => {
    setState((prev) => ({
      ...prev,
      rolesPago: prev.rolesPago.map((rol) =>
        rol.id === id ? { ...rol, estado } : rol
      ),
    }));
  };

  // Inventario functions
  const addInsumo = (insumo: Insumo) => {
    setState((prev) => ({ ...prev, insumos: [...prev.insumos, insumo] }));
  };

  const updateInsumo = (id: string, insumo: Partial<Insumo>) => {
    setState((prev) => ({
      ...prev,
      insumos: prev.insumos.map((i) => (i.id === id ? { ...i, ...insumo } : i)),
    }));
  };

  const addMovimientoInventario = (movimiento: MovimientoInventario) => {
    setState((prev) => {
      const newMovimientos = [...prev.movimientosInventario, movimiento];

      const insumo = prev.insumos.find((i) => i.id === movimiento.insumoId);
      if (insumo) {
        const newStock =
          movimiento.tipo === "entrada"
            ? insumo.stockActual + movimiento.cantidad
            : insumo.stockActual - movimiento.cantidad;

        const newInsumos = prev.insumos.map((i) =>
          i.id === movimiento.insumoId ? { ...i, stockActual: newStock } : i
        );

        return {
          ...prev,
          movimientosInventario: newMovimientos,
          insumos: newInsumos,
        };
      }

      return { ...prev, movimientosInventario: newMovimientos };
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

  // Configuración functions
  const addFinca = (finca: Finca) => {
    setState((prev) => ({ ...prev, fincas: [...prev.fincas, finca] }));
  };

  const updateFinca = (id: string, finca: Partial<Finca>) => {
    setState((prev) => ({
      ...prev,
      fincas: prev.fincas.map((f) => (f.id === id ? { ...f, ...finca } : f)),
    }));
  };

  const deleteFinca = (id: string) => {
    setState((prev) => ({
      ...prev,
      fincas: prev.fincas.filter((f) => f.id !== id),
    }));
  };

  const addUsuario = (usuario: User) => {
    setState((prev) => ({ ...prev, usuarios: [...prev.usuarios, usuario] }));
  };

  const updateUsuario = (id: string, usuario: Partial<User>) => {
    setState((prev) => ({
      ...prev,
      usuarios: prev.usuarios.map((u) =>
        u.id === id ? { ...u, ...usuario } : u
      ),
    }));
  };

  const deleteUsuario = (id: string) => {
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
    addCosecha,
    updateEnfunde,
    updateCosecha,
    addRecuperacionCinta,
    addEmpleado,
    updateEmpleado,
    addRolPago,
    addPrestamo,
    updatePrestamo,
    updateRolPagoEstado,
    addInsumo,
    updateInsumo,
    addMovimientoInventario,
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
