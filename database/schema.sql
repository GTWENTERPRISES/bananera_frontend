-- ============================================
-- ESQUEMA DE BASE DE DATOS - SISTEMA BANANERA
-- ============================================
-- Base de datos: PostgreSQL (recomendado por soporte GeoJSON)
-- Versión: PostgreSQL 13+
-- ============================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- TABLA: fincas
-- ============================================
CREATE TABLE fincas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    hectareas DECIMAL(10, 2) NOT NULL,
    ubicacion VARCHAR(255),
    responsable VARCHAR(255),
    variedad VARCHAR(100),
    plantas_totales INTEGER,
    fecha_siembra DATE,
    estado VARCHAR(20) CHECK (estado IN ('activa', 'inactiva', 'mantenimiento')) DEFAULT 'activa',
    coordenadas TEXT, -- Coordenadas en formato texto (legacy)
    telefono VARCHAR(20),
    geom GEOMETRY(POLYGON, 4326), -- Geometría GeoJSON (PostGIS)
    lotes JSONB, -- Coordenadas de lotes A-E en formato JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fincas_estado ON fincas(estado);
CREATE INDEX idx_fincas_geom ON fincas USING GIST(geom);

-- ============================================
-- TABLA: usuarios
-- ============================================
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Hash bcrypt
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('administrador', 'gerente', 'supervisor_finca', 'contador_rrhh', 'bodeguero')),
    finca_asignada UUID REFERENCES fincas(id) ON DELETE SET NULL,
    telefono VARCHAR(20),
    activo BOOLEAN DEFAULT true,
    avatar TEXT,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_finca_asignada ON usuarios(finca_asignada);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);

-- ============================================
-- TABLA: enfundes
-- ============================================
CREATE TABLE enfundes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    finca_id UUID NOT NULL REFERENCES fincas(id) ON DELETE CASCADE,
    semana INTEGER NOT NULL CHECK (semana >= 1 AND semana <= 53),
    año INTEGER NOT NULL,
    color_cinta VARCHAR(50) NOT NULL,
    cantidad_enfundes INTEGER NOT NULL CHECK (cantidad_enfundes >= 0),
    matas_caidas INTEGER NOT NULL CHECK (matas_caidas >= 0),
    fecha DATE NOT NULL,
    lote VARCHAR(10), -- Lote A, B, C, D, E
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    UNIQUE(finca_id, semana, año, color_cinta, lote)
);

CREATE INDEX idx_enfundes_finca ON enfundes(finca_id);
CREATE INDEX idx_enfundes_semana_año ON enfundes(semana, año);
CREATE INDEX idx_enfundes_fecha ON enfundes(fecha);

-- ============================================
-- TABLA: cosechas
-- ============================================
CREATE TABLE cosechas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    finca_id UUID NOT NULL REFERENCES fincas(id) ON DELETE CASCADE,
    semana INTEGER NOT NULL CHECK (semana >= 1 AND semana <= 53),
    año INTEGER NOT NULL,
    fecha DATE,
    racimos_corta INTEGER NOT NULL CHECK (racimos_corta >= 0),
    racimos_rechazados INTEGER NOT NULL CHECK (racimos_rechazados >= 0),
    racimos_recuperados INTEGER NOT NULL CHECK (racimos_recuperados >= 0),
    cajas_producidas INTEGER NOT NULL CHECK (cajas_producidas >= 0),
    peso_promedio DECIMAL(10, 2) NOT NULL,
    calibracion INTEGER NOT NULL,
    numero_manos DECIMAL(5, 2) NOT NULL,
    ratio DECIMAL(5, 2) NOT NULL,
    merma DECIMAL(5, 2) NOT NULL,
    cajas_por_lote JSONB, -- Producción por lote {A: 900, B: 600, ...}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    UNIQUE(finca_id, semana, año)
);

CREATE INDEX idx_cosechas_finca ON cosechas(finca_id);
CREATE INDEX idx_cosechas_semana_año ON cosechas(semana, año);
CREATE INDEX idx_cosechas_fecha ON cosechas(fecha);

-- ============================================
-- TABLA: recuperacion_cintas
-- ============================================
CREATE TABLE recuperacion_cintas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    finca_id UUID NOT NULL REFERENCES fincas(id) ON DELETE CASCADE,
    semana INTEGER NOT NULL CHECK (semana >= 1 AND semana <= 53),
    año INTEGER NOT NULL,
    fecha DATE,
    color_cinta VARCHAR(50),
    enfundes_iniciales INTEGER NOT NULL CHECK (enfundes_iniciales >= 0),
    primera_cal_cosecha INTEGER NOT NULL CHECK (primera_cal_cosecha >= 0),
    primera_cal_saldo INTEGER NOT NULL CHECK (primera_cal_saldo >= 0),
    segunda_cal_cosecha INTEGER NOT NULL CHECK (segunda_cal_cosecha >= 0),
    segunda_cal_saldo INTEGER NOT NULL CHECK (segunda_cal_saldo >= 0),
    tercera_cal_cosecha INTEGER NOT NULL CHECK (tercera_cal_cosecha >= 0),
    tercera_cal_saldo INTEGER NOT NULL CHECK (tercera_cal_saldo >= 0),
    barrida_final INTEGER NOT NULL CHECK (barrida_final >= 0),
    porcentaje_recuperacion DECIMAL(5, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    UNIQUE(finca_id, semana, año, color_cinta)
);

CREATE INDEX idx_recuperacion_finca ON recuperacion_cintas(finca_id);
CREATE INDEX idx_recuperacion_semana_año ON recuperacion_cintas(semana, año);

-- ============================================
-- TABLA: empleados
-- ============================================
CREATE TABLE empleados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    finca_id UUID NOT NULL REFERENCES fincas(id) ON DELETE CASCADE,
    labor VARCHAR(100) NOT NULL,
    lote VARCHAR(20),
    tarifa_diaria DECIMAL(10, 2) NOT NULL CHECK (tarifa_diaria >= 0),
    fecha_ingreso DATE NOT NULL,
    cuenta_bancaria VARCHAR(50),
    telefono VARCHAR(20),
    direccion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_empleados_finca ON empleados(finca_id);
CREATE INDEX idx_empleados_cedula ON empleados(cedula);
CREATE INDEX idx_empleados_activo ON empleados(activo);

-- ============================================
-- TABLA: roles_pago
-- ============================================
CREATE TABLE roles_pago (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empleado_id UUID NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    finca_id UUID NOT NULL REFERENCES fincas(id) ON DELETE CASCADE,
    semana INTEGER NOT NULL CHECK (semana >= 1 AND semana <= 53),
    año INTEGER NOT NULL,
    fecha DATE,
    dias_laborados INTEGER NOT NULL CHECK (dias_laborados >= 0),
    horas_extras INTEGER DEFAULT 0 CHECK (horas_extras >= 0),
    sueldo_base DECIMAL(10, 2) NOT NULL CHECK (sueldo_base >= 0),
    cosecha DECIMAL(10, 2) DEFAULT 0 CHECK (cosecha >= 0),
    tareas_especiales DECIMAL(10, 2) DEFAULT 0 CHECK (tareas_especiales >= 0),
    total_ingresos DECIMAL(10, 2) NOT NULL CHECK (total_ingresos >= 0),
    iess DECIMAL(10, 2) NOT NULL CHECK (iess >= 0),
    multas DECIMAL(10, 2) DEFAULT 0 CHECK (multas >= 0),
    prestamos DECIMAL(10, 2) DEFAULT 0 CHECK (prestamos >= 0),
    total_egresos DECIMAL(10, 2) NOT NULL CHECK (total_egresos >= 0),
    neto_a_pagar DECIMAL(10, 2) NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('pendiente', 'pagado')) DEFAULT 'pendiente',
    prestamo_aplicado BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    UNIQUE(empleado_id, semana, año)
);

CREATE INDEX idx_roles_pago_empleado ON roles_pago(empleado_id);
CREATE INDEX idx_roles_pago_finca ON roles_pago(finca_id);
CREATE INDEX idx_roles_pago_semana_año ON roles_pago(semana, año);
CREATE INDEX idx_roles_pago_estado ON roles_pago(estado);

-- ============================================
-- TABLA: prestamos
-- ============================================
CREATE TABLE prestamos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empleado_id UUID NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    monto DECIMAL(10, 2) NOT NULL CHECK (monto > 0),
    fecha_desembolso DATE NOT NULL,
    numero_cuotas INTEGER NOT NULL CHECK (numero_cuotas > 0),
    valor_cuota DECIMAL(10, 2) NOT NULL CHECK (valor_cuota > 0),
    cuotas_pagadas INTEGER DEFAULT 0 CHECK (cuotas_pagadas >= 0),
    saldo_pendiente DECIMAL(10, 2) NOT NULL CHECK (saldo_pendiente >= 0),
    estado VARCHAR(20) CHECK (estado IN ('activo', 'finalizado')) DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_prestamos_empleado ON prestamos(empleado_id);
CREATE INDEX idx_prestamos_estado ON prestamos(estado);

-- ============================================
-- TABLA: insumos
-- ============================================
CREATE TABLE insumos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('fertilizante', 'protector', 'herramienta', 'empaque', 'otro')),
    proveedor VARCHAR(255),
    unidad_medida VARCHAR(50) NOT NULL,
    stock_actual DECIMAL(10, 2) NOT NULL CHECK (stock_actual >= 0),
    stock_minimo DECIMAL(10, 2) NOT NULL CHECK (stock_minimo >= 0),
    stock_maximo DECIMAL(10, 2) NOT NULL CHECK (stock_maximo >= stock_minimo),
    precio_unitario DECIMAL(10, 2) NOT NULL CHECK (precio_unitario >= 0),
    fecha_vencimiento DATE,
    finca_id UUID REFERENCES fincas(id) ON DELETE SET NULL,
    pedido_generado BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_insumos_finca ON insumos(finca_id);
CREATE INDEX idx_insumos_categoria ON insumos(categoria);
CREATE INDEX idx_insumos_stock ON insumos(stock_actual, stock_minimo);
CREATE INDEX idx_insumos_vencimiento ON insumos(fecha_vencimiento);

-- ============================================
-- TABLA: movimientos_inventario
-- ============================================
CREATE TABLE movimientos_inventario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    insumo_id UUID NOT NULL REFERENCES insumos(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('entrada', 'salida')),
    cantidad DECIMAL(10, 2) NOT NULL CHECK (cantidad > 0),
    fecha DATE NOT NULL,
    motivo TEXT NOT NULL,
    responsable_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    responsable_nombre VARCHAR(255), -- Backup en caso de eliminación de usuario
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_movimientos_insumo ON movimientos_inventario(insumo_id);
CREATE INDEX idx_movimientos_fecha ON movimientos_inventario(fecha);
CREATE INDEX idx_movimientos_tipo ON movimientos_inventario(tipo);

-- ============================================
-- TABLA: alertas
-- ============================================
CREATE TABLE alertas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('critico', 'advertencia', 'info')),
    modulo VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    leida BOOLEAN DEFAULT false,
    accion_requerida TEXT,
    finca_id UUID REFERENCES fincas(id) ON DELETE CASCADE,
    roles_permitidos JSONB NOT NULL, -- Array de roles permitidos
    metadata JSONB, -- Datos adicionales
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alertas_tipo ON alertas(tipo);
CREATE INDEX idx_alertas_leida ON alertas(leida);
CREATE INDEX idx_alertas_finca ON alertas(finca_id);
CREATE INDEX idx_alertas_fecha ON alertas(fecha);

-- ============================================
-- TABLA: reportes
-- ============================================
CREATE TABLE reportes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('produccion', 'enfundes', 'cosechas', 'nomina', 'inventario', 'financiero')),
    finca_id UUID REFERENCES fincas(id) ON DELETE SET NULL,
    periodo VARCHAR(100) NOT NULL,
    formato VARCHAR(10) NOT NULL CHECK (formato IN ('pdf', 'excel', 'csv')),
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    archivo_path TEXT, -- Ruta del archivo generado
    parametros JSONB -- Parámetros usados para generar el reporte
);

CREATE INDEX idx_reportes_tipo ON reportes(tipo);
CREATE INDEX idx_reportes_finca ON reportes(finca_id);
CREATE INDEX idx_reportes_fecha ON reportes(fecha_generacion);

-- ============================================
-- TABLA: sesiones (para autenticación)
-- ============================================
CREATE TABLE sesiones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sesiones_usuario ON sesiones(usuario_id);
CREATE INDEX idx_sesiones_token ON sesiones(token);
CREATE INDEX idx_sesiones_expires ON sesiones(expires_at);

-- ============================================
-- TABLA: auditoria (log de cambios)
-- ============================================
CREATE TABLE auditoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tabla VARCHAR(100) NOT NULL,
    registro_id UUID NOT NULL,
    accion VARCHAR(20) NOT NULL CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE')),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45)
);

CREATE INDEX idx_auditoria_tabla ON auditoria(tabla, registro_id);
CREATE INDEX idx_auditoria_usuario ON auditoria(usuario_id);
CREATE INDEX idx_auditoria_fecha ON auditoria(fecha);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_fincas_updated_at BEFORE UPDATE ON fincas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enfundes_updated_at BEFORE UPDATE ON enfundes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cosechas_updated_at BEFORE UPDATE ON cosechas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recuperacion_updated_at BEFORE UPDATE ON recuperacion_cintas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_empleados_updated_at BEFORE UPDATE ON empleados
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_pago_updated_at BEFORE UPDATE ON roles_pago
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prestamos_updated_at BEFORE UPDATE ON prestamos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insumos_updated_at BEFORE UPDATE ON insumos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar stock de insumos cuando hay movimientos
CREATE OR REPLACE FUNCTION actualizar_stock_insumo()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tipo = 'entrada' THEN
        UPDATE insumos 
        SET stock_actual = stock_actual + NEW.cantidad
        WHERE id = NEW.insumo_id;
    ELSIF NEW.tipo = 'salida' THEN
        UPDATE insumos 
        SET stock_actual = stock_actual - NEW.cantidad
        WHERE id = NEW.insumo_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_actualizar_stock 
    AFTER INSERT ON movimientos_inventario
    FOR EACH ROW EXECUTE FUNCTION actualizar_stock_insumo();

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista: Resumen de producción por finca
CREATE OR REPLACE VIEW vista_produccion_finca AS
SELECT 
    f.id as finca_id,
    f.nombre as finca_nombre,
    c.semana,
    c.año,
    SUM(c.cajas_producidas) as total_cajas,
    AVG(c.peso_promedio) as peso_promedio,
    AVG(c.merma) as merma_promedio,
    COUNT(*) as num_cosechas
FROM cosechas c
JOIN fincas f ON c.finca_id = f.id
GROUP BY f.id, f.nombre, c.semana, c.año;

-- Vista: Stock bajo de insumos
CREATE OR REPLACE VIEW vista_insumos_stock_bajo AS
SELECT 
    i.*,
    f.nombre as finca_nombre,
    (i.stock_minimo - i.stock_actual) as deficit
FROM insumos i
LEFT JOIN fincas f ON i.finca_id = f.id
WHERE i.stock_actual < i.stock_minimo;

-- Vista: Empleados con préstamos activos
CREATE OR REPLACE VIEW vista_empleados_prestamos AS
SELECT 
    e.*,
    COUNT(p.id) as num_prestamos_activos,
    SUM(p.saldo_pendiente) as total_saldo_pendiente
FROM empleados e
LEFT JOIN prestamos p ON e.id = p.empleado_id AND p.estado = 'activo'
GROUP BY e.id;

-- ============================================
-- DATOS INICIALES (SEEDS)
-- ============================================

-- Insertar fincas de ejemplo (usar nombres reales)
-- INSERT INTO fincas (nombre, hectareas, ubicacion, estado) VALUES
-- ('BABY', 45.5, 'Valencia / Los Ríos', 'activa'),
-- ('SOLO', 38.2, 'Valencia / Los Ríos', 'activa'),
-- ('LAURITA', 52.8, 'Valencia / Los Ríos', 'activa'),
-- ('MARAVILLA', 61.3, 'Quevedo / Los Ríos', 'activa');

-- Insertar usuario administrador inicial
-- Password: 'admin123' (debe ser hasheado con bcrypt)
-- INSERT INTO usuarios (nombre, email, password_hash, rol, activo) VALUES
-- ('Administrador', 'admin@bananerahg.com', '$2b$10$...', 'administrador', true);

-- ============================================
-- COMENTARIOS FINALES
-- ============================================
-- 1. Las contraseñas deben ser hasheadas con bcrypt (cost 10-12)
-- 2. Los tokens de sesión deben ser JWT o tokens aleatorios seguros
-- 3. Considerar agregar índices adicionales según patrones de consulta
-- 4. Implementar backups regulares
-- 5. Configurar conexiones SSL para producción
-- 6. Considerar particionamiento de tablas grandes (cosechas, enfundes) por año






