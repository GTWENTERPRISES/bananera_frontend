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
  deleteEnfunde: (id: string) => void;
  deleteCosecha: (id: string) => void;
  replaceEnfundes: (data: Enfunde[]) => void;
  addRecuperacionCinta: (recuperacion: RecuperacionCinta) => void;
  updateRecuperacionCinta: (id: string, recuperacion: Partial<RecuperacionCinta>) => void;
  deleteRecuperacionCinta: (id: string) => void;

  // Nómina
  addEmpleado: (empleado: Empleado) => void;
  updateEmpleado: (id: string, empleado: Partial<Empleado>) => void;
  deleteEmpleado: (id: string) => void;
  addRolPago: (rol: RolPago) => void;
  addPrestamo: (prestamo: Prestamo) => void;
  updatePrestamo: (id: string, prestamo: Partial<Prestamo>) => void;
  updateRolPagoEstado: (id: string, estado: "pendiente" | "pagado") => void;

  // Inventario
  addInsumo: (insumo: Insumo) => void;
  updateInsumo: (id: string, insumo: Partial<Insumo>) => void;
  addMovimientoInventario: (movimiento: MovimientoInventario) => void;
  generarOrdenCompra: (insumoId: string) => void;

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

  // Sembrar datos de 2024 si faltan para reportes
  useEffect(() => {
    const tiene2024 = state.cosechas.some((c) => c.año === 2024) || state.enfundes.some((e) => e.año === 2024);
    if (!tiene2024) {
      const fincas = ["BABY","SOLO","LAURITA","MARAVILLA"] as const;
      const semanas = [1, 10, 20, 30, 45];
      const nuevosEnfundes: Enfunde[] = [];
      const nuevasCosechas: Cosecha[] = [];

      fincas.forEach((finca, fi) => {
        semanas.forEach((sem, si) => {
          const base = 900 + fi * 120 + si * 60;
          const cajas = 1800 + fi * 200 + si * 120;
          nuevosEnfundes.push({
            id: `seed-2024-enf-${finca}-${sem}`,
            finca,
            semana: sem,
            año: 2024,
            colorCinta: "Azul",
            cantidadEnfundes: base,
            matasCaidas: 5 + si,
            fecha: `2024-01-01`,
          } as Enfunde);
          nuevasCosechas.push({
            id: `seed-2024-cos-${finca}-${sem}`,
            finca,
            semana: sem,
            año: 2024,
            racimosCorta: Math.round(base * 0.9),
            racimosRechazados: 30 + si,
            racimosRecuperados: Math.round(base * 0.88),
            cajasProducidas: cajas,
            pesoPromedio: 42,
            calibracion: 46,
            numeroManos: 9,
            ratio: 2.2,
            merma: 3.5,
            cajasPorLote: { A: Math.round(cajas * 0.35), B: Math.round(cajas * 0.25), C: Math.round(cajas * 0.2), D: Math.round(cajas * 0.12), E: Math.round(cajas * 0.08) },
          } as Cosecha);
        });
      });

      setState((prev) => ({
        ...prev,
        enfundes: [...prev.enfundes, ...nuevosEnfundes],
        cosechas: [...prev.cosechas, ...nuevasCosechas],
      }));
    }
  }, [state.enfundes, state.cosechas]);

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
    setState((prev) => ({ ...prev, enfundes: [enfunde, ...prev.enfundes] }));
  };

  const replaceEnfundes = (data: Enfunde[]) => {
    setState((prev) => ({ ...prev, enfundes: data }));
  };

  const addCosecha = (cosecha: Cosecha) => {
    setState((prev) => ({ ...prev, cosechas: [cosecha, ...prev.cosechas] }));
  };

  const updateEnfunde = (id: string, enfunde: Partial<Enfunde>) => {
    setState((prev) => ({
      ...prev,
      enfundes: prev.enfundes.map((e) =>
        e.id === id ? { ...e, ...enfunde } : e
      ),
    }));
  };

  const deleteEnfunde = (id: string) => {
    setState((prev) => ({
      ...prev,
      enfundes: prev.enfundes.filter((e) => e.id !== id),
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

  const deleteCosecha = (id: string) => {
    setState((prev) => ({
      ...prev,
      cosechas: prev.cosechas.filter((c) => c.id !== id),
    }));
  };

  const addRecuperacionCinta = (recuperacion: RecuperacionCinta) => {
    setState((prev) => ({
      ...prev,
      recuperacionCintas: [recuperacion, ...prev.recuperacionCintas],
    }));
  };

  const updateRecuperacionCinta = (id: string, recuperacion: Partial<RecuperacionCinta>) => {
    setState((prev) => ({
      ...prev,
      recuperacionCintas: prev.recuperacionCintas.map((r) =>
        r.id === id ? { ...r, ...recuperacion } : r
      ),
    }));
  };

  const deleteRecuperacionCinta = (id: string) => {
    setState((prev) => ({
      ...prev,
      recuperacionCintas: prev.recuperacionCintas.filter((r) => r.id !== id),
    }));
  };

  // Nómina functions
  const addEmpleado = (empleado: Empleado) => {
    setState((prev) => ({ ...prev, empleados: [empleado, ...prev.empleados] }));
  };

  const updateEmpleado = (id: string, empleado: Partial<Empleado>) => {
    setState((prev) => ({
      ...prev,
      empleados: prev.empleados.map((e) =>
        e.id === id ? { ...e, ...empleado } : e
      ),
    }));
  };

  const deleteEmpleado = (id: string) => {
    setState((prev) => ({
      ...prev,
      empleados: prev.empleados.filter((e) => e.id !== id),
    }));
  };

  const addRolPago = (rol: RolPago) => {
    setState((prev) => ({ ...prev, rolesPago: [rol, ...prev.rolesPago] }));
  };

  const addPrestamo = (prestamo: Prestamo) => {
    setState((prev) => ({ ...prev, prestamos: [prestamo, ...prev.prestamos] }));
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
              const desc = Math.min(p.valorCuota, p.saldoPendiente);
              totalDesc += desc;
              updates[p.id] = {
                ...p,
                cuotasPagadas: p.cuotasPagadas + 1,
                saldoPendiente: Math.max(0, p.saldoPendiente - desc),
                estado: p.cuotasPagadas + 1 >= p.numeroCuotas || p.saldoPendiente - desc <= 0 ? "finalizado" : "activo",
              };
            }
            newPrestamos = prev.prestamos.map((x) => (updates[x.id] ? updates[x.id] : x));
            newRoles = prev.rolesPago.map((r) =>
              r.id === id
                ? {
                    ...r,
                    prestamos: Number(totalDesc.toFixed(2)),
                    totalEgresos: Number((r.iess + r.multas + totalDesc).toFixed(2)),
                    netoAPagar: Number((r.totalIngresos - (r.iess + r.multas + totalDesc)).toFixed(2)),
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
            const revertAmount = Math.min(p.valorCuota, remaining);
            const cuotasPagadas = Math.max(0, p.cuotasPagadas - 1);
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

  // Inventario functions
  const addInsumo = (insumo: Insumo) => {
    setState((prev) => ({ ...prev, insumos: [insumo, ...prev.insumos] }));
  };

  const updateInsumo = (id: string, insumo: Partial<Insumo>) => {
    setState((prev) => ({
      ...prev,
      insumos: prev.insumos.map((i) => (i.id === id ? { ...i, ...insumo } : i)),
    }));
  };

  const addMovimientoInventario = (movimiento: MovimientoInventario) => {
    setState((prev) => {
      const newMovimientos = [movimiento, ...prev.movimientosInventario];

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
