export interface Finca {
  id: string;
  nombre: string;
  hectareas: number;
  ubicacion?: string;
  responsable?: string;
  telefono?: string;
  activa?: boolean;
  variedad?: string;
  plantasTotales?: number;
  fechaSiembra?: string;
  estado?: "activa" | "inactiva" | "mantenimiento";
  coordenadas?: string;
  geom?: {
    type: "Polygon" | "MultiPolygon";
    coordinates: any;
  };
  lotes?: {
    A?: { lat: number; lng: number };
    B?: { lat: number; lng: number };
    C?: { lat: number; lng: number };
    D?: { lat: number; lng: number };
    E?: { lat: number; lng: number };
  };
}

export type FincaName = "BABY" | "SOLO" | "LAURITA" | "MARAVILLA";

export type UserRole =
  | "administrador"
  | "gerente"
  | "supervisor_finca"
  | "contador_rrhh"
  | "bodeguero";

export interface User {
  id: string;
  nombre: string;
  email: string;
  password?: string;
  rol: UserRole;
  fincaAsignada?: string;
  fincaNombre?: string;
  telefono?: string;
  activo: boolean;
  avatar?: string;
}

export interface Enfunde {
  id: string;
  finca: string;
  fincaId?: string;
  semana: number;
  año: number;
  colorCinta: string;
  cantidadEnfundes: number;
  matasCaidas: number;
  fecha: string;
  observaciones?: string;
}

export interface Cosecha {
  id: string;
  finca: string;
  fincaId?: string;
  semana: number;
  año: number;
  fecha?: string;
  lote?: string;
  racimosCorta?: number;
  racimosRechazados?: number;
  racimosRecuperados: number;
  cajasProducidas: number;
  pesoPromedio: number;
  calibracion: number;
  numeroManos: number;
  ratio: number;
  merma?: number;
  observaciones?: string;
  cajasPorLote?: {
    A?: number;
    B?: number;
    C?: number;
    D?: number;
    E?: number;
  };
}

export interface Empleado {
  id: string;
  nombre: string;
  cedula: string;
  finca: string;
  fincaId?: string;
  cargo: string;
  labor?: string;
  lote?: string;
  salarioBase: number;
  tarifaDiaria?: number;
  fechaIngreso: string;
  cuentaBancaria?: string;
  telefono?: string;
  direccion?: string;
  activo: boolean;
}

export interface RolPago {
  id: string;
  empleadoId: string;
  empleadoNombre?: string;
  fincaNombre?: string;
  empleado?: Empleado;
  finca?: string;
  semana?: number;
  año?: number;
  fechaPago: string;
  periodoInicio?: string;
  periodoFin?: string;
  fecha?: string;
  diasLaborados?: number;
  horasExtras?: number;
  salarioBase: number;
  sueldoBase?: number;
  bonificaciones?: number;
  deducciones?: number;
  cosecha?: number;
  tareasEspeciales?: number;
  totalIngresos?: number;
  iess?: number;
  multas?: number;
  prestamos?: number;
  totalEgresos?: number;
  netoAPagar: number;
  estado: "pendiente" | "aprobado" | "pagado";
  observaciones?: string;
  prestamoAplicado?: boolean;
}

export interface Prestamo {
  id: string;
  empleadoId: string;
  empleadoNombre?: string;
  fincaNombre?: string;
  empleado?: Empleado;
  monto: number;
  montoPagado?: number;
  fechaDesembolso?: string;
  fechaSolicitud?: string;
  fechaAprobacion?: string;
  numeroCuotas?: number;
  cuotas?: number;
  cuotasPagadas?: number;
  valorCuota?: number;
  saldoPendiente: number;
  motivo?: string;
  observaciones?: string;
  estado: "pendiente" | "aprobado" | "pagado" | "rechazado" | "activo" | "finalizado";
}

export interface Insumo {
  id: string;
  nombre: string;
  categoria: "fertilizante" | "protector" | "herramienta" | "empaque" | "quimico" | "par" | "otro";
  proveedor?: string;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
  stockMaximo?: number;
  stockStatus?: "normal" | "bajo" | "critico";
  precioUnitario: number;
  fechaVencimiento?: string;
  finca?: string;
  fincaId?: string;
  pedidoGenerado?: boolean;
}

export interface MovimientoInventario {
  id: string;
  insumoId: string;
  insumoNombre?: string;
  finca?: string;
  fincaId?: string;
  tipo: "entrada" | "salida";
  cantidad: number;
  fecha: string;
  motivo?: string;
  responsable?: string;
  responsableId?: string;
  responsableNombre?: string;
  observaciones?: string;
}

export interface Alerta {
  id: string;
  tipo: "critico" | "advertencia" | "info" | "inventario" | "produccion" | "nomina";
  prioridad?: "alta" | "media" | "baja";
  modulo?: string;
  titulo: string;
  mensaje?: string;
  descripcion?: string;
  fecha?: string;
  fechaCreacion?: string;
  leida: boolean;
  accionRequerida?: string;
  finca?: string;
  fincaId?: string;
  rolesPermitidos?: UserRole[];
  metadata?: Record<string, string>;
}

export interface KPI {
  label: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down" | "neutral";
  icon?: string;
}

export interface RecuperacionCinta {
  id: string;
  finca?: string;
  fincaNombre?: string;
  enfundeId?: string;
  enfundeInfo?: string;
  semana?: number;
  año?: number;
  fecha?: string;
  colorCinta?: string;
  cintasRecuperadas?: number;
  enfundesIniciales?: number;
  primeraCalCosecha?: number;
  primeraCalSaldo?: number;
  segundaCalCosecha?: number;
  segundaCalSaldo?: number;
  terceraCalCosecha?: number;
  terceraCalSaldo?: number;
  barridaFinal?: number;
  porcentajeRecuperacion: number;
  observaciones?: string;
}

export interface Reporte {
  id: string;
  tipo:
    | "produccion"
    | "enfundes"
    | "cosechas"
    | "nomina"
    | "inventario"
    | "financiero";
  finca: FincaName | "todas";
  periodo: string;
  formato: "pdf" | "excel" | "csv";
  fechaGeneracion: string;
  generadoPor: string;
}

export interface AIInsight {
  id: string;
  tipo: "success" | "warning" | "info" | "error";
  titulo: string;
  descripcion: string;
  fecha: string;
  prioridad: "alta" | "media" | "baja";
}
