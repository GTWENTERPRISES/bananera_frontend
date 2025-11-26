import { z } from "zod";

const FincaEnum = z.enum(["BABY", "SOLO", "LAURITA", "MARAVILLA"]);
const CategoriaEnum = z.enum(["fertilizante", "protector", "herramienta", "empaque", "otro"]);
const UserRoleEnum = z.enum(["administrador", "gerente", "supervisor_finca", "contador_rrhh", "bodeguero"]);

export const isValidEcuadorPhone = (raw: string) => {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return false;
  if (digits.startsWith("593")) {
    const rest = digits.slice(3);
    if (rest.length === 9 && rest.startsWith("9")) return true;
    if (rest.length === 8 && /^[2-7]/.test(rest[0])) return true;
    return false;
  }
  if (digits.startsWith("0")) {
    if (digits.length === 10 && digits[1] === "9") return true;
    if (digits.length === 9 && /^[2-7]/.test(digits[1])) return true;
    return false;
  }
  return false;
};

export const isValidEcuadorCedula = (cedula: string) => {
  const digits = cedula.replace(/\D/g, "");
  if (!/^\d{10}$/.test(digits)) return false;
  const provincia = parseInt(digits.slice(0, 2), 10);
  if (provincia < 1 || provincia > 24) return false;
  const tercero = parseInt(digits[2], 10);
  if (tercero >= 6) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let num = parseInt(digits[i], 10);
    if ((i + 1) % 2 !== 0) {
      num *= 2;
      if (num > 9) num -= 9;
    }
    sum += num;
  }
  const modulo = sum % 10;
  const check = modulo === 0 ? 0 : 10 - modulo;
  return check === parseInt(digits[9], 10);
};

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const nonEmpty = z.string().trim().min(1);
const numberString = z.string().trim().refine((v) => !Number.isNaN(Number(v)));
const intString = z.string().trim().refine((v) => Number.isInteger(Number(v)));

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const UsuarioSchema = z.object({
  nombre: nonEmpty,
  email: z.string().email(),
  password: z.string().optional(),
  rol: UserRoleEnum,
  fincaAsignada: z.string().optional(),
  telefono: z
    .string()
    .optional()
    .refine((v) => !v || isValidEcuadorPhone(v)),
  activo: z.boolean(),
});

export const EmpleadoSchema = z.object({
  nombre: nonEmpty,
  cedula: nonEmpty.refine((v) => isValidEcuadorCedula(v)),
  labor: nonEmpty,
  finca: FincaEnum,
  tarifaDiaria: numberString.refine((v) => Number(v) >= 0),
  fechaIngreso: dateString,
  telefono: z
    .string()
    .optional()
    .refine((v) => !v || isValidEcuadorPhone(v)),
  activo: z.boolean(),
  lote: z.string().optional(),
  direccion: z.string().optional(),
  cuentaBancaria: z.string().optional(),
});

export const InsumoSchema = z.object({
  nombre: nonEmpty,
  categoria: CategoriaEnum,
  unidadMedida: nonEmpty,
  stockActual: numberString.refine((v) => Number(v) >= 0),
  stockMinimo: numberString.refine((v) => Number(v) >= 0),
  stockMaximo: numberString.refine((v) => Number(v) >= 0),
  precioUnitario: numberString.refine((v) => Number(v) >= 0),
  proveedor: nonEmpty,
  finca: z.string().optional(),
});

export const MovimientoInventarioSchema = z.object({
  insumoId: nonEmpty,
  tipo: z.enum(["entrada", "salida"]),
  cantidad: numberString.refine((v) => Number(v) > 0),
  finca: FincaEnum,
  motivo: nonEmpty,
  responsable: nonEmpty,
});

export const EnfundeSchema = z.object({
  finca: FincaEnum,
  semana: intString.refine((v) => {
    const n = Number(v);
    return n >= 1 && n <= 52;
  }),
  año: intString,
  colorCinta: nonEmpty,
  cantidadEnfundes: intString.refine((v) => Number(v) >= 0),
  matasCaidas: intString.refine((v) => Number(v) >= 0),
  fecha: dateString,
});

export const CosechaSchema = z.object({
  finca: FincaEnum,
  semana: intString.refine((v) => {
    const n = Number(v);
    return n >= 1 && n <= 52;
  }),
  año: intString,
  racimosCorta: intString.refine((v) => Number(v) >= 0),
  racimosRechazados: intString.refine((v) => Number(v) >= 0),
  cajasProducidas: intString.refine((v) => Number(v) >= 0),
  pesoPromedio: numberString.refine((v) => Number(v) >= 0),
  calibracion: intString.refine((v) => Number(v) >= 0),
  numeroManos: numberString.refine((v) => Number(v) >= 0),
});

export const RecuperacionCintaSchema = z.object({
  finca: FincaEnum,
  semana: intString.refine((v) => {
    const n = Number(v);
    return n >= 1 && n <= 52;
  }),
  año: intString,
  enfundesIniciales: intString.refine((v) => Number(v) >= 0),
  primeraCalCosecha: intString.refine((v) => Number(v) >= 0),
  segundaCalCosecha: intString.refine((v) => Number(v) >= 0),
  terceraCalCosecha: intString.refine((v) => Number(v) >= 0),
  barridaFinal: intString.refine((v) => Number(v) >= 0),
});

export const PrestamoSchema = z.object({
  empleadoId: nonEmpty,
  monto: numberString.refine((v) => Number(v) > 0),
  numeroCuotas: intString.refine((v) => Number(v) >= 1),
  fechaDesembolso: dateString,
  motivo: z.string().optional(),
});

export const RolPagoInputSchema = z.object({
  empleadoId: nonEmpty,
  semana: intString.refine((v) => {
    const n = Number(v);
    return n >= 1 && n <= 52;
  }),
  año: intString,
  diasLaborados: intString.refine((v) => {
    const n = Number(v);
    return n >= 0 && n <= 7;
  }),
  horasExtras: numberString.refine((v) => Number(v) >= 0).optional(),
  cosecha: numberString.refine((v) => Number(v) >= 0).optional(),
  tareasEspeciales: numberString.refine((v) => Number(v) >= 0).optional(),
  multas: numberString.refine((v) => Number(v) >= 0).optional(),
  prestamos: numberString.refine((v) => Number(v) >= 0).optional(),
});

export const FincaSchema = z.object({
  nombre: nonEmpty,
  hectareas: numberString.refine((v) => Number(v) > 0),
  ubicacion: z.string().optional(),
  responsable: z.string().optional(),
  variedad: z.enum(["Cavendish", "Clon", "Otro"]),
  plantasTotales: numberString.refine((v) => Number(v) >= 0),
  fechaSiembra: z.string().optional(),
  estado: z.enum(["activa", "inactiva"]),
  coordenadas: z.string().optional(),
  telefono: z
    .string()
    .optional()
    .refine((v) => !v || isValidEcuadorPhone(v)),
});