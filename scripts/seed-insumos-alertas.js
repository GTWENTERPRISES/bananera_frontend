/**
 * Script para poblar la base de datos con insumos que generan alertas de inventario
 * Ejecutar: node scripts/seed-insumos-alertas.js
 */

const BASE_URL = 'http://localhost:8000/api';

// Credenciales de admin
const ADMIN_EMAIL = 'admin@bananerahg.com';
const ADMIN_PASSWORD = 'admin123';

let authToken = null;

// Insumos con stock bajo para generar alertas (stockActual < stockMinimo)
const insumosConAlerta = [
  {
    nombre: "Fungicida Mancozeb 80%",
    categoria: "protector",
    proveedor: "AgroQuímicos SA",
    unidad_medida: "litro",
    stock_actual: 15,
    stock_minimo: 100,
    stock_maximo: 300,
    precio_unitario: 12.80,
    fecha_vencimiento: "2025-06-30",
    finca: null
  },
  {
    nombre: "Cinta Azul Marcadora",
    categoria: "empaque",
    proveedor: "Empaques HG",
    unidad_medida: "rollo",
    stock_actual: 8,
    stock_minimo: 50,
    stock_maximo: 200,
    precio_unitario: 8.20,
    fecha_vencimiento: "2025-03-15",
    finca: null
  },
  {
    nombre: "Cinta Roja Marcadora",
    categoria: "empaque",
    proveedor: "Empaques HG",
    unidad_medida: "rollo",
    stock_actual: 12,
    stock_minimo: 60,
    stock_maximo: 200,
    precio_unitario: 8.00,
    fecha_vencimiento: "2025-02-28",
    finca: null
  },
  {
    nombre: "Cinta Verde Marcadora",
    categoria: "empaque",
    proveedor: "Empaques HG",
    unidad_medida: "rollo",
    stock_actual: 5,
    stock_minimo: 60,
    stock_maximo: 220,
    precio_unitario: 8.00,
    fecha_vencimiento: "2025-02-20",
    finca: null
  },
  {
    nombre: "Fertilizante Urea 46%",
    categoria: "fertilizante",
    proveedor: "AgroQuímicos SA",
    unidad_medida: "kg",
    stock_actual: 80,
    stock_minimo: 200,
    stock_maximo: 800,
    precio_unitario: 1.10,
    fecha_vencimiento: "2025-08-31",
    finca: null
  },
  {
    nombre: "Desinfectante Industrial",
    categoria: "protector",
    proveedor: "AgroQuímicos SA",
    unidad_medida: "litro",
    stock_actual: 10,
    stock_minimo: 80,
    stock_maximo: 300,
    precio_unitario: 10.50,
    fecha_vencimiento: "2025-04-15",
    finca: null
  },
  {
    nombre: "Cajas Cartón Reforzado",
    categoria: "empaque",
    proveedor: "Empaques HG",
    unidad_medida: "unidad",
    stock_actual: 800,
    stock_minimo: 3000,
    stock_maximo: 9000,
    precio_unitario: 1.10,
    finca: null
  },
  {
    nombre: "Guantes Nitrilo Talla M",
    categoria: "herramienta",
    proveedor: "SegurAgro",
    unidad_medida: "par",
    stock_actual: 25,
    stock_minimo: 120,
    stock_maximo: 400,
    precio_unitario: 2.90,
    finca: null
  },
  {
    nombre: "Fertilizante NPK 12-12-17",
    categoria: "fertilizante",
    proveedor: "AgroQuímicos SA",
    unidad_medida: "kg",
    stock_actual: 100,
    stock_minimo: 250,
    stock_maximo: 900,
    precio_unitario: 1.35,
    fecha_vencimiento: "2025-05-10",
    finca: null
  },
  {
    nombre: "Plástico Protector Racimo",
    categoria: "protector",
    proveedor: "Plásticos del Banano",
    unidad_medida: "unidad",
    stock_actual: 500,
    stock_minimo: 2500,
    stock_maximo: 6000,
    precio_unitario: 0.18,
    finca: null
  },
  {
    nombre: "Mascarillas N95",
    categoria: "herramienta",
    proveedor: "SegurAgro",
    unidad_medida: "unidad",
    stock_actual: 20,
    stock_minimo: 100,
    stock_maximo: 500,
    precio_unitario: 1.50,
    finca: null
  },
  {
    nombre: "Insecticida Clorpirifos",
    categoria: "protector",
    proveedor: "AgroQuímicos SA",
    unidad_medida: "litro",
    stock_actual: 8,
    stock_minimo: 50,
    stock_maximo: 150,
    precio_unitario: 15.00,
    fecha_vencimiento: "2025-07-20",
    finca: null
  }
];

async function seedInsumos() {
  console.log('🌱 Iniciando seed de insumos con alertas...\n');
  
  let exitosos = 0;
  let fallidos = 0;

  for (const insumo of insumosConAlerta) {
    try {
      const response = await fetch(`${BASE_URL}/insumos/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(insumo),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Creado: ${insumo.nombre} (Stock: ${insumo.stock_actual}/${insumo.stock_minimo})`);
        exitosos++;
      } else {
        const error = await response.text();
        console.log(`❌ Error en ${insumo.nombre}: ${error}`);
        fallidos++;
      }
    } catch (error) {
      console.log(`❌ Error de conexión para ${insumo.nombre}: ${error.message}`);
      fallidos++;
    }
  }

  console.log(`\n📊 Resumen: ${exitosos} creados, ${fallidos} fallidos`);
  console.log(`🔔 Ahora deberías ver ${exitosos} alertas de inventario en el dashboard`);
}

seedInsumos();
