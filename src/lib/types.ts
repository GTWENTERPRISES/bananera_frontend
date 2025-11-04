export interface Finca {
  id: string;
  nombre: string;
  hectareas: number;
  ubicacion: string;
  responsable: string;
  variedad: string;
  plantasTotales: number;
  // Propiedades opcionales que puedes agregar si las necesitas
  fechaSiembra?: string;
  estado?: string;
  coordenadas?: string;
  telefono?: string;
}

export type FincaName = "BABY" | "SOLO" | "LAURITA" | "MARAVILLA";

export type UserRole =
  | "administrador"
  | "gerente"
  | "supervisor"
  | "operador"
  | "consulta";

export interface User {
  id: string;
  nombre: string;
  email: string;
  password: string;
  rol: UserRole;
  fincaAsignada?: string;
  telefono?: string;
  activo: boolean;
  avatar?: string;
}

export interface Enfunde {
  id: string;
  finca: FincaName;
  semana: number;
  año: number;
  colorCinta: string;
  cantidadEnfundes: number;
  matasCaidas: number;
  fecha: string;
}

export interface Cosecha {
  id: string;
  finca: FincaName;
  semana: number;
  año: number;
  racimosCorta: number;
  racimosRechazados: number;
  racimosRecuperados: number;
  cajasProducidas: number;
  pesoPromedio: number;
  calibracion: number;
  numeroManos: number;
  ratio: number;
  merma: number;
}

export interface Empleado {
  id: string;
  nombre: string;
  cedula: string;
  finca: FincaName;
  labor: string;
  lote?: string;
  tarifaDiaria: number;
  fechaIngreso: string;
  cuentaBancaria?: string;
  telefono?: string;
  direccion?: string;
  activo: boolean;
}

export interface RolPago {
  id: string;
  empleadoId: string;
  empleado: Empleado;
  finca: FincaName;
  semana: number;
  año: number;
  diasLaborados: number;
  horasExtras?: number;
  sueldoBase: number;
  cosecha: number;
  tareasEspeciales: number;
  totalIngresos: number;
  iess: number;
  multas: number;
  prestamos: number;
  totalEgresos: number;
  netoAPagar: number;
  estado: "pendiente" | "pagado";
}

export interface Prestamo {
  id: string;
  empleadoId: string;
  empleado: Empleado;
  monto: number;
  fechaDesembolso: string;
  numeroCuotas: number;
  valorCuota: number;
  cuotasPagadas: number;
  saldoPendiente: number;
  estado: "activo" | "finalizado";
}

export interface Insumo {
  id: string;
  nombre: string;
  categoria: "fertilizante" | "protector" | "herramienta" | "empaque" | "otro";
  proveedor: string;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
  stockMaximo: number;
  precioUnitario: number;
  fechaVencimiento?: string;
}

export interface MovimientoInventario {
  id: string;
  insumoId: string;
  tipo: "entrada" | "salida";
  cantidad: number;
  fecha: string;
  motivo: string;
  responsable: string;
}

export interface Alerta {
  id: string;
  tipo: "critico" | "advertencia" | "info";
  modulo: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  leida: boolean;
  accionRequerida?: string;
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
  finca: FincaName;
  semana: number;
  año: number;
  enfundesIniciales: number;
  primeraCalCosecha: number;
  primeraCalSaldo: number;
  segundaCalCosecha: number;
  segundaCalSaldo: number;
  terceraCalCosecha: number;
  terceraCalSaldo: number;
  barridaFinal: number;
  porcentajeRecuperacion: number;
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
