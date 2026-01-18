-- ============================================
-- DATOS INICIALES (SEEDS) - SISTEMA BANANERA
-- ============================================
-- Ejecutar después de crear el esquema
-- ============================================

-- Insertar fincas
INSERT INTO fincas (id, nombre, hectareas, ubicacion, responsable, variedad, plantas_totales, estado) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'BABY', 45.5, 'Valencia / Los Ríos', 'Juan Pérez', 'Cavendish', 50000, 'activa'),
('550e8400-e29b-41d4-a716-446655440002', 'SOLO', 38.2, 'Valencia / Los Ríos', 'María González', 'Cavendish', 42000, 'activa'),
('550e8400-e29b-41d4-a716-446655440003', 'LAURITA', 52.8, 'Valencia / Los Ríos', 'Carlos Hernández', 'Cavendish', 58000, 'activa'),
('550e8400-e29b-41d4-a716-446655440004', 'MARAVILLA', 61.3, 'Quevedo / Los Ríos', 'Ana Torres', 'Cavendish', 67000, 'activa');

-- NOTA: Las contraseñas deben ser hasheadas con bcrypt
-- Ejemplo: 'admin123' -> '$2b$10$...'
-- Usar herramienta online o script para generar hashes
-- Por ahora, usar este hash de ejemplo (cambiar en producción)
-- Password: 'admin123'
INSERT INTO usuarios (id, nombre, email, password_hash, rol, activo) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Carlos Hernández', 'admin@bananerahg.com', '$2b$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'administrador', true),
('660e8400-e29b-41d4-a716-446655440002', 'María González', 'gerente@bananerahg.com', '$2b$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'gerente', true),
('660e8400-e29b-41d4-a716-446655440003', 'Juan Pérez', 'supervisor@bananerahg.com', '$2b$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'supervisor_finca', true),
('660e8400-e29b-41d4-a716-446655440004', 'Ana Torres', 'rrhh@bananerahg.com', '$2b$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'contador_rrhh', true),
('660e8400-e29b-41d4-a716-446655440005', 'Luis Mendoza', 'bodega@bananerahg.com', '$2b$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'bodeguero', true);

-- Asignar fincas a usuarios
UPDATE usuarios SET finca_asignada = '550e8400-e29b-41d4-a716-446655440001' WHERE email = 'supervisor@bananerahg.com';

-- Insertar empleados de ejemplo
INSERT INTO empleados (id, nombre, cedula, finca_id, labor, lote, tarifa_diaria, fecha_ingreso, activo) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Pedro Ramírez', '0912345678', '550e8400-e29b-41d4-a716-446655440001', 'Enfunde', 'A-12', 18.50, '2023-03-15', true),
('770e8400-e29b-41d4-a716-446655440002', 'Luis Mendoza', '0923456789', '550e8400-e29b-41d4-a716-446655440001', 'Cosecha', 'A-15', 20.00, '2022-08-20', true),
('770e8400-e29b-41d4-a716-446655440003', 'Ana Torres', '0934567890', '550e8400-e29b-41d4-a716-446655440002', 'Calibración', 'B-08', 19.00, '2023-01-10', true);

-- Insertar insumos de ejemplo
INSERT INTO insumos (id, nombre, categoria, proveedor, unidad_medida, stock_actual, stock_minimo, stock_maximo, precio_unitario, finca_id) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'Fertilizante NPK 15-15-15', 'fertilizante', 'AgroQuímicos SA', 'kg', 450, 200, 1000, 1.25, '550e8400-e29b-41d4-a716-446655440001'),
('880e8400-e29b-41d4-a716-446655440002', 'Protector de racimo', 'protector', 'Plásticos del Banano', 'unidad', 8500, 5000, 15000, 0.15, '550e8400-e29b-41d4-a716-446655440003'),
('880e8400-e29b-41d4-a716-446655440003', 'Cinta de colores', 'empaque', 'Empaques HG', 'rollo', 120, 80, 300, 8.50, '550e8400-e29b-41d4-a716-446655440002');

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 1. CAMBIAR los hashes de contraseña antes de usar en producción
-- 2. Generar hashes reales usando bcrypt:
--    const bcrypt = require('bcrypt');
--    const hash = await bcrypt.hash('password', 10);
-- 3. Los UUIDs son ejemplos, generar nuevos si es necesario
-- 4. Agregar más datos según necesidades






