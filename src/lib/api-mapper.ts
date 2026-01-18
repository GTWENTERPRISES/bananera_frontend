/**
 * Mappers para convertir datos del backend (snake_case) al frontend (camelCase)
 */

import type { User, Enfunde, Cosecha, Empleado, RolPago, Prestamo, Insumo, MovimientoInventario, Alerta, RecuperacionCinta, Finca } from './types';

export function mapFinca(data: any): Finca {
  return {
    id: data.id,
    nombre: data.nombre,
    ubicacion: data.ubicacion || '',
    hectareas: Number(data.hectareas) || 0,
    responsable: data.responsable || '',
    telefono: data.telefono || '',
    activa: data.activa ?? true,
  };
}

export function mapUser(data: any): User {
  return {
    id: data.id,
    email: data.email,
    nombre: data.nombre,
    rol: data.rol,
    fincaAsignada: data.finca_asignada || undefined,
    fincaNombre: data.finca_nombre || undefined,
    telefono: data.telefono || '',
    activo: data.activo ?? true,
    avatar: data.avatar || '',
  };
}

export function mapEnfunde(data: any): Enfunde {
  return {
    id: data.id,
    finca: data.finca_nombre || data.finca,
    fincaId: data.finca,
    fecha: data.fecha,
    semana: data.semana,
    año: data.año,
    colorCinta: data.color_cinta,
    cantidadEnfundes: data.cantidad_enfundes,
    matasCaidas: data.matas_caidas || 0,
    observaciones: data.observaciones || '',
  };
}

export function mapCosecha(data: any): Cosecha {
  return {
    id: data.id,
    finca: data.finca_nombre || data.finca,
    fincaId: data.finca,
    fecha: data.fecha,
    semana: data.semana,
    año: data.año,
    lote: data.lote || '',
    cajasProducidas: data.cajas_producidas,
    racimosRecuperados: data.racimos_recuperados || 0,
    pesoPromedio: Number(data.peso_promedio) || 0,
    calibracion: Number(data.calibracion) || 0,
    numeroManos: data.manos || 0,
    ratio: Number(data.ratio) || 0,
    observaciones: data.observaciones || '',
  };
}

export function mapRecuperacion(data: any): RecuperacionCinta {
  return {
    id: data.id,
    enfundeId: data.enfunde,
    enfundeInfo: data.enfunde_info || '',
    fincaNombre: data.finca_nombre || '',
    fecha: data.fecha,
    cintasRecuperadas: data.cintas_recuperadas,
    porcentajeRecuperacion: Number(data.porcentaje_recuperacion) || 0,
    observaciones: data.observaciones || '',
  };
}

export function mapEmpleado(data: any): Empleado {
  return {
    id: data.id,
    finca: data.finca_nombre || data.finca,
    fincaId: data.finca,
    nombre: data.nombre,
    cedula: data.cedula,
    cargo: data.cargo,
    salarioBase: Number(data.salario_base) || 0,
    fechaIngreso: data.fecha_ingreso,
    telefono: data.telefono || '',
    direccion: data.direccion || '',
    activo: data.activo ?? true,
  };
}

export function mapRolPago(data: any): RolPago {
  return {
    id: data.id,
    empleadoId: data.empleado,
    empleadoNombre: data.empleado_nombre || '',
    fincaNombre: data.finca_nombre || '',
    fechaPago: data.fecha_pago,
    periodoInicio: data.periodo_inicio,
    periodoFin: data.periodo_fin,
    salarioBase: Number(data.salario_base) || 0,
    horasExtras: Number(data.horas_extras) || 0,
    bonificaciones: Number(data.bonificaciones) || 0,
    deducciones: Number(data.deducciones) || 0,
    netoAPagar: Number(data.total_pagar) || 0,
    estado: data.estado,
    observaciones: data.observaciones || '',
  };
}

export function mapPrestamo(data: any): Prestamo {
  return {
    id: data.id,
    empleadoId: data.empleado,
    empleadoNombre: data.empleado_nombre || '',
    fincaNombre: data.finca_nombre || '',
    monto: Number(data.monto) || 0,
    montoPagado: Number(data.monto_pagado) || 0,
    saldoPendiente: Number(data.saldo_pendiente) || 0,
    cuotas: data.cuotas,
    cuotasPagadas: data.cuotas_pagadas || 0,
    fechaSolicitud: data.fecha_solicitud,
    fechaAprobacion: data.fecha_aprobacion,
    estado: data.estado,
    motivo: data.motivo || '',
    observaciones: data.observaciones || '',
  };
}

export function mapInsumo(data: any): Insumo {
  return {
    id: data.id,
    finca: data.finca_nombre || data.finca,
    fincaId: data.finca,
    nombre: data.nombre,
    categoria: data.categoria,
    proveedor: data.proveedor || '',
    unidadMedida: data.unidad_medida,
    stockActual: Number(data.stock_actual) || 0,
    stockMinimo: Number(data.stock_minimo) || 0,
    stockMaximo: Number(data.stock_maximo) || 0,
    stockStatus: data.stock_status || 'normal',
    precioUnitario: Number(data.precio_unitario) || 0,
    fechaVencimiento: data.fecha_vencimiento,
    pedidoGenerado: data.pedido_generado ?? false,
  };
}

export function mapMovimiento(data: any): MovimientoInventario {
  return {
    id: data.id,
    insumoId: data.insumo,
    insumoNombre: data.insumo_nombre || '',
    finca: data.finca_nombre || data.finca,
    fincaId: data.finca,
    tipo: data.tipo,
    cantidad: data.cantidad,
    fecha: data.fecha,
    responsableId: data.responsable,
    responsableNombre: data.responsable_nombre || '',
    observaciones: data.observaciones || '',
  };
}

export function mapAlerta(data: any): Alerta {
  return {
    id: data.id,
    tipo: data.tipo,
    prioridad: data.prioridad,
    titulo: data.titulo,
    mensaje: data.mensaje,
    leida: data.leida ?? false,
    finca: data.finca_nombre || data.finca,
    fincaId: data.finca,
    fechaCreacion: data.fecha_creacion,
  };
}

// Mappers inversos (frontend -> backend)
export function toBackendEnfunde(data: Partial<Enfunde>): any {
  return {
    finca: data.fincaId || data.finca,
    fecha: data.fecha,
    semana: data.semana,
    año: data.año,
    color_cinta: data.colorCinta,
    cantidad_enfundes: data.cantidadEnfundes,
    matas_caidas: data.matasCaidas,
    observaciones: data.observaciones,
  };
}

export function toBackendCosecha(data: Partial<Cosecha>): any {
  return {
    finca: data.fincaId || data.finca,
    fecha: data.fecha,
    semana: data.semana,
    año: data.año,
    lote: data.lote,
    cajas_producidas: data.cajasProducidas,
    racimos_recuperados: data.racimosRecuperados,
    peso_promedio: data.pesoPromedio,
    calibracion: data.calibracion,
    manos: data.numeroManos,
    ratio: data.ratio,
    observaciones: data.observaciones,
  };
}

export function toBackendEmpleado(data: Partial<Empleado>): any {
  return {
    finca: data.fincaId || data.finca,
    nombre: data.nombre,
    cedula: data.cedula,
    cargo: data.cargo,
    salario_base: data.salarioBase,
    fecha_ingreso: data.fechaIngreso,
    telefono: data.telefono,
    direccion: data.direccion,
    activo: data.activo,
  };
}

export function toBackendInsumo(data: Partial<Insumo>): any {
  return {
    finca: data.fincaId || data.finca,
    nombre: data.nombre,
    categoria: data.categoria,
    proveedor: data.proveedor,
    unidad_medida: data.unidadMedida,
    stock_actual: data.stockActual,
    stock_minimo: data.stockMinimo,
    stock_maximo: data.stockMaximo,
    precio_unitario: data.precioUnitario,
    fecha_vencimiento: data.fechaVencimiento,
  };
}
