# Sistema de Gestión Integral para Operaciones Bananeras

## Documentación Técnica para Trabajo de Titulación

**Versión:** 1.0  
**Fecha:** Enero 2026  
**Ubicación:** Los Ríos, Ecuador

---

## Índice

1. [Introducción](#1-introducción)
2. [Problemática](#2-problemática)
3. [Objetivos del Sistema](#3-objetivos-del-sistema)
4. [Arquitectura del Sistema](#4-arquitectura-del-sistema)
5. [Stack Tecnológico](#5-stack-tecnológico)
6. [Módulos del Sistema](#6-módulos-del-sistema)
7. [Modelo de Datos](#7-modelo-de-datos)
8. [Sistema de Autenticación y Autorización](#8-sistema-de-autenticación-y-autorización)
9. [Integración de Inteligencia Artificial](#9-integración-de-inteligencia-artificial)
10. [Interfaces de Usuario](#10-interfaces-de-usuario)
11. [API REST](#11-api-rest)
12. [Seguridad](#12-seguridad)
13. [Despliegue](#13-despliegue)
14. [Conclusiones](#14-conclusiones)

---

## 1. Introducción

### 1.1 Contexto

El sector bananero ecuatoriano representa una de las principales fuentes de ingresos del país, siendo Ecuador el mayor exportador de banano a nivel mundial. Las operaciones de una finca bananera involucran múltiples procesos interrelacionados: producción (enfundes y cosechas), gestión de inventarios, administración de personal y análisis de rendimiento.

### 1.2 Descripción del Sistema

El **Sistema de Gestión Integral para Operaciones Bananeras** es una aplicación web que digitaliza y automatiza los procesos operativos de fincas bananeras. El sistema permite el registro, seguimiento y análisis de todas las actividades productivas, administrativas y financieras, proporcionando información en tiempo real para la toma de decisiones.

### 1.3 Alcance

El sistema abarca la gestión de:
- **4 fincas bananeras** ubicadas en la provincia de Los Ríos
- **Producción semanal** de enfundes y cosechas
- **Inventario** de insumos agrícolas
- **Nómina** de empleados y roles de pago
- **Reportes** y análisis estadísticos
- **Predicciones** mediante inteligencia artificial

---

## 2. Problemática

### 2.1 Situación Actual

Las operaciones bananeras tradicionalmente se gestionan mediante:
- Registros manuales en cuadernos y hojas de cálculo
- Comunicación verbal entre supervisores y administración
- Cálculos manuales de nómina y producción
- Falta de visibilidad en tiempo real del estado de las operaciones

### 2.2 Problemas Identificados

| Problema | Impacto |
|----------|---------|
| Registros manuales propensos a errores | Datos inconsistentes, pérdida de información |
| Falta de integración entre áreas | Duplicidad de trabajo, decisiones tardías |
| Ausencia de alertas automáticas | Desabastecimiento de insumos, pérdidas |
| Cálculos manuales de nómina | Errores en pagos, demoras |
| Sin análisis predictivo | Planificación reactiva en lugar de proactiva |

### 2.3 Justificación

La implementación de un sistema integrado permite:
- Reducir errores humanos en un 95%
- Disminuir tiempos de registro en un 70%
- Generar alertas preventivas automáticas
- Tomar decisiones basadas en datos históricos y proyecciones

---

## 3. Objetivos del Sistema

### 3.1 Objetivo General

Desarrollar e implementar un sistema web integral que permita la gestión eficiente de las operaciones productivas, administrativas y financieras de fincas bananeras, incorporando inteligencia artificial para el análisis predictivo.

### 3.2 Objetivos Específicos

1. **Digitalizar el registro de producción** mediante formularios intuitivos para enfundes y cosechas
2. **Automatizar el control de inventario** con alertas de stock bajo y vencimientos
3. **Gestionar la nómina** con cálculo automático de salarios, bonificaciones y deducciones
4. **Generar reportes dinámicos** con filtros temporales y comparativas entre fincas
5. **Implementar análisis predictivo** mediante integración con modelos de IA
6. **Garantizar la seguridad** mediante autenticación JWT y control de acceso basado en roles

---

## 4. Arquitectura del Sistema

### 4.1 Arquitectura General

El sistema implementa una arquitectura **Cliente-Servidor** de tres capas:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CAPA DE PRESENTACIÓN                          │
│                                                                         │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│   │   Desktop   │  │   Tablet    │  │   Mobile    │  │   PWA       │   │
│   │   Browser   │  │   Browser   │  │   Browser   │  │             │   │
│   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘   │
│          │                │                │                │          │
│          └────────────────┴────────────────┴────────────────┘          │
│                                    │                                    │
│                           Next.js 16 + React 19                         │
│                           TailwindCSS + shadcn/ui                       │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTPS
                                     │ REST API
┌────────────────────────────────────┴────────────────────────────────────┐
│                           CAPA DE NEGOCIO                               │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    Django REST Framework                         │   │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │   │
│   │  │  Auth    │ │Producción│ │Inventario│ │  Nómina  │           │   │
│   │  │  JWT     │ │  Views   │ │  Views   │ │  Views   │           │   │
│   │  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │   │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │   │
│   │  │ Fincas   │ │ Alertas  │ │ Reportes │ │ Usuarios │           │   │
│   │  │  Views   │ │  Views   │ │  Views   │ │  Views   │           │   │
│   │  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │   │
│   └─────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ ORM
┌────────────────────────────────────┴────────────────────────────────────┐
│                           CAPA DE DATOS                                 │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    PostgreSQL + PostGIS                          │   │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │   │
│   │  │ usuarios │ │  fincas  │ │ enfundes │ │ cosechas │           │   │
│   │  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │   │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │   │
│   │  │ insumos  │ │empleados │ │roles_pago│ │prestamos │           │   │
│   │  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │   │
│   └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘

                    SERVICIOS EXTERNOS
┌─────────────────────────────────────────────────────────────────────────┐
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │   Google Gemini  │  │   Leaflet Maps   │  │   Exportación    │      │
│  │   AI API         │  │   (OpenStreetMap)│  │   PDF/Excel      │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Patrón de Diseño

El sistema implementa los siguientes patrones:

- **MVC (Model-View-Controller)**: Separación de lógica de negocio, presentación y datos
- **Repository Pattern**: Abstracción del acceso a datos
- **Context API**: Gestión de estado global en React
- **Singleton**: Servicios únicos como el cliente de Gemini AI

### 4.3 Comunicación entre Capas

```
Frontend (Next.js)          Backend (Django)           Base de Datos
      │                           │                          │
      │  1. HTTP Request          │                          │
      │  (JWT en Header)          │                          │
      │ ────────────────────────► │                          │
      │                           │  2. Validar Token        │
      │                           │  3. Verificar Permisos   │
      │                           │                          │
      │                           │  4. Query ORM            │
      │                           │ ────────────────────────►│
      │                           │                          │
      │                           │  5. Resultado            │
      │                           │ ◄────────────────────────│
      │                           │                          │
      │  6. JSON Response         │                          │
      │ ◄──────────────────────── │                          │
      │                           │                          │
      │  7. Actualizar UI         │                          │
      │                           │                          │
```

---

## 5. Stack Tecnológico

### 5.1 Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js** | 16 | Framework React con SSR y App Router |
| **React** | 19 | Librería para interfaces de usuario |
| **TypeScript** | 5.x | Tipado estático para JavaScript |
| **TailwindCSS** | 3.x | Framework CSS utility-first |
| **shadcn/ui** | Latest | Componentes UI accesibles |
| **Recharts** | 2.x | Gráficos y visualizaciones |
| **Leaflet** | 1.9 | Mapas interactivos |
| **Lucide React** | Latest | Iconografía |

### 5.2 Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Python** | 3.11+ | Lenguaje de programación |
| **Django** | 5.x | Framework web |
| **Django REST Framework** | 3.14+ | API REST |
| **Simple JWT** | 5.x | Autenticación con tokens |
| **PostgreSQL** | 15+ | Base de datos relacional |
| **PostGIS** | 3.x | Extensión geoespacial |

### 5.3 Inteligencia Artificial

| Tecnología | Propósito |
|------------|-----------|
| **Google Gemini API** | Modelo de lenguaje para análisis y notificaciones inteligentes |
| **gemini-1.5-flash** | Modelo específico utilizado (gratuito) |

### 5.4 Herramientas de Desarrollo

| Herramienta | Propósito |
|-------------|-----------|
| **Git** | Control de versiones |
| **VS Code / Windsurf** | IDE de desarrollo |
| **Postman** | Testing de APIs |
| **pgAdmin** | Administración de PostgreSQL |

---

## 6. Módulos del Sistema

### 6.1 Diagrama de Módulos

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SISTEMA DE GESTIÓN BANANERA                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │  DASHBOARD  │  │ PRODUCCIÓN  │  │ INVENTARIO  │  │   NÓMINA    │   │
│  │             │  │             │  │             │  │             │   │
│  │ • KPIs      │  │ • Enfundes  │  │ • Insumos   │  │ • Empleados │   │
│  │ • Gráficos  │  │ • Cosechas  │  │ • Stock     │  │ • Roles     │   │
│  │ • Alertas   │  │ • Cintas    │  │ • Alertas   │  │ • Préstamos │   │
│  │ • Resumen   │  │ • Heatmap   │  │ • Movim.    │  │ • Reportes  │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │  REPORTES   │  │  ANALYTICS  │  │   CONFIG    │  │  AGENTE IA  │   │
│  │             │  │             │  │             │  │             │   │
│  │ • Producción│  │ • Predictivo│  │ • Usuarios  │  │ • Gemini    │   │
│  │ • Comparati.│  │ • Tendencias│  │ • Fincas    │  │ • Notific.  │   │
│  │ • Filtros   │  │ • Proyecc.  │  │ • Permisos  │  │ • Análisis  │   │
│  │ • Exportar  │  │ • Riesgos   │  │ • Roles     │  │ • Recomend. │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Módulo de Dashboard

**Descripción:** Panel principal que presenta un resumen ejecutivo del estado actual de las operaciones.

**Funcionalidades:**
- Visualización de KPIs principales (producción semanal, cajas totales, empleados activos)
- Gráficos de tendencia de producción
- Lista de alertas activas
- Accesos rápidos a módulos frecuentes

**Componentes:**
- `StatsCards`: Tarjetas con métricas clave
- `ProductionChart`: Gráfico de producción por semana
- `AlertsList`: Lista de alertas pendientes
- `QuickActions`: Botones de acceso rápido

### 6.3 Módulo de Producción

**Descripción:** Gestión del ciclo productivo del banano, desde el enfunde hasta la cosecha.

#### 6.3.1 Submódulo de Enfundes

| Campo | Tipo | Descripción |
|-------|------|-------------|
| Finca | Select | Finca donde se realiza el enfunde |
| Semana | Number | Semana del año (1-52) |
| Año | Number | Año de registro |
| Color de Cinta | Select | Identificador de semana de enfunde |
| Cantidad | Number | Número de enfundes realizados |
| Matas Caídas | Number | Plantas que cayeron durante el proceso |
| Observaciones | Text | Notas adicionales |

#### 6.3.2 Submódulo de Cosechas

| Campo | Tipo | Descripción |
|-------|------|-------------|
| Finca | Select | Finca de la cosecha |
| Semana | Number | Semana de corte |
| Lote | Select | Subdivisión de finca (A, B, C, D, E) |
| Cajas Producidas | Number | Total de cajas empacadas |
| Racimos Cortados | Number | Racimos procesados |
| Peso Promedio | Decimal | Peso promedio por racimo (lb) |
| Ratio | Decimal | Cajas/Racimo (calculado automáticamente) |
| Merma | Decimal | Porcentaje de rechazo |

#### 6.3.3 Submódulo de Recuperación de Cintas

**Propósito:** Controlar el porcentaje de cintas recuperadas vs utilizadas en enfundes.

**Métricas:**
- Cintas recuperadas por cosecha
- Porcentaje de recuperación
- Alertas cuando recuperación < 80%

### 6.4 Módulo de Inventario

**Descripción:** Control de insumos agrícolas con alertas automáticas.

#### 6.4.1 Catálogo de Insumos

| Categoría | Ejemplos |
|-----------|----------|
| Fertilizantes | Urea, NPK, Potasio |
| Protectores | Fundas, Cintas, Corbatines |
| Herramientas | Curvos, Podones, Calibradores |
| Empaques | Cajas, Cartones, Etiquetas |
| Químicos | Fungicidas, Herbicidas |

#### 6.4.2 Control de Stock

```
Stock Actual vs Stock Mínimo
┌────────────────────────────────────────────┐
│ Stock Máximo ─────────────────── 100%      │
│                                            │
│ Stock Actual ────────────────── Variable   │
│                                            │
│ Stock Mínimo ─────────────────── Alerta    │
│ (Genera notificación automática)           │
│                                            │
│ Stock Crítico ────────────────── Urgente   │
│ (≤50% del mínimo)                          │
└────────────────────────────────────────────┘
```

#### 6.4.3 Movimientos de Inventario

| Tipo | Descripción |
|------|-------------|
| Entrada | Compras, devoluciones, transferencias entrantes |
| Salida | Consumo, pérdidas, transferencias salientes |

### 6.5 Módulo de Nómina

**Descripción:** Gestión integral del personal y procesamiento de pagos.

#### 6.5.1 Gestión de Empleados

| Campo | Descripción |
|-------|-------------|
| Nombre | Nombre completo del empleado |
| Cédula | Número de identificación |
| Finca | Finca asignada |
| Cargo | Función (Cortador, Enfundador, Supervisor, etc.) |
| Salario Base | Remuneración base semanal |
| Fecha Ingreso | Fecha de contratación |
| Estado | Activo / Inactivo |

#### 6.5.2 Roles de Pago

**Cálculo automático:**
```
Total Ingresos = Salario Base + Horas Extras + Bonificaciones
Total Egresos  = IESS + Multas + Cuota Préstamo
Neto a Pagar   = Total Ingresos - Total Egresos
```

#### 6.5.3 Préstamos

| Estado | Descripción |
|--------|-------------|
| Pendiente | Solicitud en revisión |
| Aprobado | Préstamo activo, descontando cuotas |
| Pagado | Préstamo finalizado |
| Rechazado | Solicitud denegada |

### 6.6 Módulo de Reportes

**Descripción:** Generación de informes y análisis estadísticos.

**Tipos de Reportes:**
1. **Producción por Finca**: Cajas producidas, ratio, merma
2. **Comparativa de Fincas**: Análisis lado a lado
3. **Tendencias Temporales**: Evolución semanal/mensual/anual
4. **Inventario**: Stock actual, movimientos, vencimientos
5. **Nómina**: Pagos realizados, préstamos activos

**Formatos de Exportación:**
- PDF (reportes formales)
- Excel (análisis en hojas de cálculo)
- CSV (importación a otros sistemas)

### 6.7 Módulo de Analytics Predictivo

**Descripción:** Proyecciones y análisis basados en datos históricos.

**Funcionalidades:**
- Proyección de producción (1, 3, 6, 12 meses)
- Estimación de precios de mercado
- Análisis de factores de riesgo
- Recomendaciones automáticas

**Parámetros Configurables:**
| Parámetro | Opciones |
|-----------|----------|
| Período de proyección | 1, 3, 6, 12 meses |
| Nivel de confianza | Alta, Media, Baja |
| Finca | Individual o todas |

### 6.8 Módulo de Agente IA (Gemini)

**Descripción:** Asistente inteligente que analiza los datos del sistema y genera notificaciones accionables.

**Flujo de Funcionamiento:**

```
┌──────────────────────────────────────────────────────────────────┐
│                    AGENTE DE NOTIFICACIONES IA                   │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  1. RECOLECCIÓN DE DATOS (APIs Django)                           │
│     • /api/insumos/      → Stock actual, mínimos                 │
│     • /api/cosechas/     → Producción, ratios                    │
│     • /api/enfundes/     → Enfundes, matas caídas                │
│     • /api/empleados/    → Personal activo/inactivo              │
│     • /api/prestamos/    → Deudas activas                        │
│     • /api/roles-pago/   → Pagos pendientes                      │
│     • /api/alertas/      → Alertas existentes                    │
│     • /api/fincas/       → Información de fincas                 │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  2. CONSTRUCCIÓN DE CONTEXTO                                     │
│     • Detectar insumos con stock bajo/crítico                    │
│     • Calcular promedios de producción                           │
│     • Identificar matas caídas elevadas (>3%)                    │
│     • Verificar recuperación de cintas (<80%)                    │
│     • Revisar roles de pago pendientes                           │
│     • Analizar préstamos activos                                 │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  3. PROCESAMIENTO CON GEMINI AI                                  │
│     • Modelo: gemini-1.5-flash                                   │
│     • Temperature: 0.3 (respuestas consistentes)                 │
│     • Prompt estructurado con instrucciones específicas          │
│     • Respuesta en formato JSON                                  │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  4. GENERACIÓN DE NOTIFICACIONES                                 │
│     Tipos:                                                       │
│     • Crítico    → Acción inmediata requerida                    │
│     • Advertencia → Atención preventiva                          │
│     • Info       → Información general                           │
│     • Oportunidad → Mejora potencial detectada                   │
└──────────────────────────────────────────────────────────────────┘
```

**Ejemplo de Notificación Generada:**

```json
{
  "tipo": "critico",
  "modulo": "inventario",
  "titulo": "Stock Crítico de Fertilizante",
  "descripcion": "El fertilizante NPK en Finca BABY tiene solo 12 unidades, cuando el mínimo es 50. Al ritmo actual de consumo, se agotará en aproximadamente 4 días.",
  "accionRecomendada": "Generar orden de compra urgente para al menos 100 unidades.",
  "prioridad": 9,
  "finca": "BABY"
}
```

---

## 7. Modelo de Datos

### 7.1 Diagrama Entidad-Relación

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   USUARIO   │       │    FINCA    │       │  EMPLEADO   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │       │ id (PK)     │
│ nombre      │       │ nombre      │       │ nombre      │
│ email       │   ┌──►│ hectareas   │◄──┐   │ cedula      │
│ rol         │   │   │ ubicacion   │   │   │ finca (FK)  │──┐
│ finca (FK)  │───┘   │ geom        │   │   │ cargo       │  │
│ activo      │       └─────────────┘   │   │ salario     │  │
└─────────────┘              │          │   │ activo      │  │
                             │          │   └─────────────┘  │
                             │          │          │         │
              ┌──────────────┴──────────┴──────────┘         │
              │                                              │
              ▼                                              │
┌─────────────────────┐  ┌─────────────────────┐            │
│      ENFUNDE        │  │      COSECHA        │            │
├─────────────────────┤  ├─────────────────────┤            │
│ id (PK)             │  │ id (PK)             │            │
│ finca (FK)          │  │ finca (FK)          │            │
│ semana              │  │ semana              │            │
│ año                 │  │ año                 │            │
│ color_cinta         │  │ lote                │            │
│ cantidad_enfundes   │  │ cajas_producidas    │            │
│ matas_caidas        │  │ racimos_cortados    │            │
│ fecha               │  │ ratio               │            │
└─────────────────────┘  │ merma               │            │
         │               └─────────────────────┘            │
         │                                                  │
         ▼                                                  │
┌─────────────────────┐                                     │
│   RECUPERACION      │                                     │
├─────────────────────┤                                     │
│ id (PK)             │                                     │
│ enfunde (FK)        │                                     │
│ cintas_recuperadas  │                                     │
│ porcentaje          │                                     │
└─────────────────────┘                                     │
                                                            │
┌─────────────────────┐  ┌─────────────────────┐           │
│      INSUMO         │  │    MOVIMIENTO       │           │
├─────────────────────┤  ├─────────────────────┤           │
│ id (PK)             │  │ id (PK)             │           │
│ nombre              │  │ insumo (FK)         │───────────┤
│ categoria           │  │ tipo                │           │
│ finca (FK)          │  │ cantidad            │           │
│ stock_actual        │  │ fecha               │           │
│ stock_minimo        │  │ responsable (FK)    │───────────┤
│ precio_unitario     │  └─────────────────────┘           │
└─────────────────────┘                                    │
                                                           │
┌─────────────────────┐  ┌─────────────────────┐          │
│     ROL_PAGO        │  │     PRESTAMO        │          │
├─────────────────────┤  ├─────────────────────┤          │
│ id (PK)             │  │ id (PK)             │          │
│ empleado (FK)       │◄─┤ empleado (FK)       │◄─────────┘
│ fecha_pago          │  │ monto               │
│ salario_base        │  │ cuotas              │
│ bonificaciones      │  │ saldo_pendiente     │
│ deducciones         │  │ estado              │
│ total_pagar         │  └─────────────────────┘
│ estado              │
└─────────────────────┘
```

### 7.2 Entidades Principales

#### Usuario
```typescript
interface User {
  id: string;
  nombre: string;
  email: string;
  rol: 'administrador' | 'gerente' | 'supervisor_finca' | 'contador_rrhh' | 'bodeguero';
  fincaAsignada?: string;
  activo: boolean;
}
```

#### Finca
```typescript
interface Finca {
  id: string;
  nombre: string;
  hectareas: number;
  ubicacion: string;
  geom?: GeoJSON;  // Geometría PostGIS
  lotes?: { A, B, C, D, E };
}
```

#### Enfunde
```typescript
interface Enfunde {
  id: string;
  finca: string;
  semana: number;
  año: number;
  colorCinta: string;
  cantidadEnfundes: number;
  matasCaidas: number;
  fecha: string;
}
```

#### Cosecha
```typescript
interface Cosecha {
  id: string;
  finca: string;
  semana: number;
  año: number;
  lote: string;
  cajasProducidas: number;
  racimosRecuperados: number;
  pesoPromedio: number;
  ratio: number;  // Calculado: cajas/racimos
  merma: number;
}
```

#### Insumo
```typescript
interface Insumo {
  id: string;
  nombre: string;
  categoria: 'fertilizante' | 'protector' | 'herramienta' | 'empaque' | 'quimico';
  finca: string;
  stockActual: number;
  stockMinimo: number;
  stockMaximo: number;
  precioUnitario: number;
  fechaVencimiento?: string;
}
```

---

## 8. Sistema de Autenticación y Autorización

### 8.1 Autenticación JWT

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE AUTENTICACIÓN                       │
└─────────────────────────────────────────────────────────────────┘

1. Login
   Usuario ──────► POST /api/login/
                   { email, password }
                          │
                          ▼
   Servidor ◄───── { access_token, refresh_token }
                          │
                          ▼
   Cliente ──────► Guardar tokens en localStorage

2. Peticiones Autenticadas
   Cliente ──────► GET /api/recurso/
                   Header: Authorization: Bearer {access_token}
                          │
                          ▼
   Servidor ──────► Validar token
                   Verificar permisos
                   Retornar datos

3. Refresh Token
   Cuando access_token expira (5 min):
   Cliente ──────► POST /api/token/refresh/
                   { refresh_token }
                          │
                          ▼
   Servidor ◄───── { new_access_token }
```

### 8.2 Control de Acceso Basado en Roles (RBAC)

| Rol | Descripción | Alcance |
|-----|-------------|---------|
| **Administrador** | Control total | Todo el sistema |
| **Gerente** | Gestión ejecutiva | Todas las fincas, sin config. |
| **Supervisor de Finca** | Operaciones diarias | Solo su finca asignada |
| **Contador/RRHH** | Nómina y finanzas | Nómina de todas las fincas |
| **Bodeguero** | Control de inventario | Solo inventario de su finca |

### 8.3 Matriz de Permisos

```
┌────────────────┬───────────┬───────────┬───────────┬───────────┬───────────┐
│     Módulo     │   Admin   │  Gerente  │ Supervisor│  Contador │ Bodeguero │
├────────────────┼───────────┼───────────┼───────────┼───────────┼───────────┤
│ Dashboard      │    ✅     │    ✅     │   ✅*     │    ✅     │   ✅*     │
│ Producción     │    ✅     │    ✅     │   ✅*     │    👁️     │    ❌     │
│ Inventario     │    ✅     │    ✅     │    👁️     │    👁️     │   ✅*     │
│ Nómina         │    ✅     │    ✅     │    ❌     │    ✅     │    ❌     │
│ Reportes       │    ✅     │    ✅     │   ✅*     │    ✅     │    ❌     │
│ Analytics      │    ✅     │    ✅     │   ✅*     │    ❌     │    ❌     │
│ Configuración  │    ✅     │    ❌     │    ❌     │    ❌     │    ❌     │
└────────────────┴───────────┴───────────┴───────────┴───────────┴───────────┘

✅ = Acceso completo  |  ✅* = Solo su finca  |  👁️ = Solo lectura  |  ❌ = Sin acceso
```

---

## 9. Integración de Inteligencia Artificial

### 9.1 Tecnología Utilizada

| Componente | Descripción |
|------------|-------------|
| **Proveedor** | Google AI (Gemini) |
| **Modelo** | gemini-1.5-flash |
| **Tipo** | Large Language Model (LLM) |
| **Costo** | Gratuito (tier free) |
| **Límites** | 60 req/min, 1500 req/día |

### 9.2 Casos de Uso de IA

1. **Análisis de Inventario**
   - Detectar insumos con stock crítico
   - Predecir fechas de agotamiento
   - Recomendar cantidades de reorden

2. **Análisis de Producción**
   - Identificar tendencias de producción
   - Detectar anomalías en ratios
   - Comparar rendimiento entre fincas

3. **Gestión de Personal**
   - Alertar sobre pagos pendientes
   - Monitorear préstamos activos
   - Detectar patrones de ausentismo

4. **Notificaciones Inteligentes**
   - Generar alertas contextuales
   - Priorizar según urgencia
   - Proponer acciones específicas

### 9.3 Arquitectura del Agente IA

```typescript
// Servicio de Gemini
class GeminiService {
  // Configuración
  setApiKey(key: string): void;
  isConfigured(): boolean;
  
  // Obtención de datos
  fetchDataFromBackend(): Promise<NotificationContext>;
  
  // Generación de notificaciones
  generateNotificationsFromBackend(): Promise<SmartNotification[]>;
  
  // Construcción de prompt
  private buildPrompt(context: NotificationContext): string;
  
  // Parsing de respuesta
  private parseNotifications(text: string): SmartNotification[];
}
```

### 9.4 Estructura de Notificación Inteligente

```typescript
interface SmartNotification {
  id: string;
  tipo: 'critico' | 'advertencia' | 'info' | 'oportunidad';
  modulo: 'inventario' | 'produccion' | 'nomina' | 'sistema';
  titulo: string;
  descripcion: string;
  accionRecomendada: string;
  prioridad: number;  // 1-10
  finca?: string;
  generadoPorIA: boolean;
  timestamp: string;
}
```

---

## 10. Interfaces de Usuario

### 10.1 Diseño Responsivo

El sistema implementa diseño adaptativo para tres breakpoints:

| Dispositivo | Ancho | Características |
|-------------|-------|-----------------|
| Desktop | ≥1024px | Sidebar expandido, tablas completas |
| Tablet | 768-1023px | Sidebar colapsable, tablas scrollables |
| Mobile | <768px | Menú hamburguesa, cards apiladas |

### 10.2 Sistema de Diseño

**Colores Principales:**
- Primary: Verde (#22c55e) - Acciones principales
- Destructive: Rojo (#ef4444) - Alertas críticas
- Warning: Amarillo (#eab308) - Advertencias
- Muted: Gris (#6b7280) - Texto secundario

**Componentes UI (shadcn/ui):**
- Cards para contenedores de información
- DataTables para listados con paginación
- Forms con validación en tiempo real
- Modals para acciones destructivas
- Toasts para notificaciones

### 10.3 Navegación

```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo] Sistema Bananera HG          🤖 🔔 👤 Juan García ▼      │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────────────────────────────────────┐ │
│ │             │ │                                             │ │
│ │ 📊 Dashboard│ │                                             │ │
│ │             │ │              ÁREA DE CONTENIDO              │ │
│ │ 🌱 Producción│ │                                             │ │
│ │  └ Enfundes │ │     Cards, Tablas, Gráficos, Formularios   │ │
│ │  └ Cosechas │ │                                             │ │
│ │  └ Cintas   │ │                                             │ │
│ │             │ │                                             │ │
│ │ 📦 Inventario│ │                                             │ │
│ │  └ Insumos  │ │                                             │ │
│ │  └ Movim.   │ │                                             │ │
│ │  └ Alertas  │ │                                             │ │
│ │             │ │                                             │ │
│ │ 👷 Nómina   │ │                                             │ │
│ │  └ Empleados│ │                                             │ │
│ │  └ Roles    │ │                                             │ │
│ │  └ Préstamos│ │                                             │ │
│ │             │ │                                             │ │
│ │ 📈 Reportes │ │                                             │ │
│ │ 🔮 Analytics│ │                                             │ │
│ │ ⚙️ Config   │ │                                             │ │
│ └─────────────┘ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 11. API REST

### 11.1 Convenciones

- **Base URL:** `http://localhost:8000/api/`
- **Formato:** JSON
- **Autenticación:** Bearer Token (JWT)
- **Versionado:** No implementado (v1 implícito)

### 11.2 Endpoints Principales

#### Autenticación
```
POST   /api/login/              # Obtener tokens
POST   /api/token/refresh/      # Refrescar access token
GET    /api/usuarios/me/        # Usuario actual
```

#### Fincas
```
GET    /api/fincas/             # Listar fincas
POST   /api/fincas/             # Crear finca
GET    /api/fincas/{id}/        # Detalle de finca
PUT    /api/fincas/{id}/        # Actualizar finca
DELETE /api/fincas/{id}/        # Eliminar finca
```

#### Producción
```
GET    /api/enfundes/           # Listar enfundes
POST   /api/enfundes/           # Registrar enfunde
GET    /api/cosechas/           # Listar cosechas
POST   /api/cosechas/           # Registrar cosecha
GET    /api/recuperaciones/     # Listar recuperaciones
POST   /api/recuperaciones/     # Registrar recuperación
```

#### Inventario
```
GET    /api/insumos/            # Listar insumos
POST   /api/insumos/            # Crear insumo
PATCH  /api/insumos/{id}/       # Actualizar stock
GET    /api/movimientos-inventario/  # Listar movimientos
POST   /api/movimientos-inventario/  # Registrar movimiento
GET    /api/alertas/            # Listar alertas
```

#### Nómina
```
GET    /api/empleados/          # Listar empleados
POST   /api/empleados/          # Crear empleado
GET    /api/roles-pago/         # Listar roles de pago
POST   /api/roles-pago/         # Generar rol de pago
GET    /api/prestamos/          # Listar préstamos
POST   /api/prestamos/          # Registrar préstamo
```

### 11.3 Ejemplo de Respuesta

```json
// GET /api/cosechas/
{
  "count": 150,
  "next": "/api/cosechas/?page=2",
  "previous": null,
  "results": [
    {
      "id": "uuid-1234",
      "finca": "uuid-finca",
      "finca_nombre": "BABY",
      "semana": 3,
      "año": 2026,
      "cajas_producidas": 1250,
      "racimos_recuperados": 580,
      "peso_promedio": 45.5,
      "ratio": 2.15,
      "fecha": "2026-01-15"
    }
  ]
}
```

---

## 12. Seguridad

### 12.1 Medidas Implementadas

| Aspecto | Implementación |
|---------|----------------|
| **Autenticación** | JWT con expiración de 5 minutos |
| **Autorización** | RBAC (Role-Based Access Control) |
| **Transporte** | HTTPS obligatorio en producción |
| **Passwords** | Hash con bcrypt/Argon2 |
| **CORS** | Configurado solo para dominios permitidos |
| **CSRF** | Tokens en formularios |
| **XSS** | Sanitización de inputs con React |
| **SQL Injection** | ORM de Django (queries parametrizadas) |

### 12.2 Almacenamiento de Credenciales

```
┌─────────────────────────────────────────────────────────────────┐
│                    ALMACENAMIENTO SEGURO                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Browser (localStorage)                                         │
│  ├── accessToken      → JWT, expira en 5 min                   │
│  ├── refreshToken     → JWT, expira en 24 horas                │
│  ├── currentUser      → Datos no sensibles del usuario         │
│  └── gemini_api_key   → API key de Gemini (opcional)           │
│                                                                 │
│  Servidor (PostgreSQL)                                          │
│  ├── password         → Hash irreversible (nunca texto plano)  │
│  └── tokens           → No almacenados (stateless JWT)         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 13. Despliegue

### 13.1 Arquitectura de Despliegue

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRODUCCIÓN                               │
└─────────────────────────────────────────────────────────────────┘

     Internet
         │
         ▼
┌─────────────────┐
│   CDN/Proxy     │  ← Caché estático, SSL termination
│   (Cloudflare)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│    Frontend     │     │    Backend      │
│    (Vercel)     │────►│    (Railway)    │
│    Next.js      │     │    Django       │
└─────────────────┘     └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   PostgreSQL    │
                        │   (Neon/Supabase)│
                        └─────────────────┘
```

### 13.2 Variables de Entorno

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=https://api.bananera.com/api
```

**Backend (.env):**
```
DEBUG=False
SECRET_KEY=<key-segura>
DATABASE_URL=postgresql://user:pass@host:5432/db
ALLOWED_HOSTS=api.bananera.com
CORS_ALLOWED_ORIGINS=https://bananera.com
```

---

## 14. Conclusiones

### 14.1 Logros Alcanzados

1. **Digitalización completa** de los procesos operativos de la bananera
2. **Integración de módulos** que antes operaban de forma aislada
3. **Automatización de alertas** para prevenir desabastecimientos
4. **Incorporación de IA** para análisis predictivo y notificaciones inteligentes
5. **Control de acceso** basado en roles para seguridad de la información

### 14.2 Beneficios Obtenidos

| Área | Antes | Después | Mejora |
|------|-------|---------|--------|
| Registro de datos | Manual, 30 min | Digital, 5 min | -83% tiempo |
| Errores de registro | ~15% | ~2% | -87% errores |
| Alertas de stock | Ninguna | Automáticas | 100% cobertura |
| Reportes | Semanales manuales | Tiempo real | Instantáneo |
| Decisiones | Reactivas | Predictivas | Proactivas |

### 14.3 Trabajo Futuro

1. **Aplicación móvil nativa** para supervisores en campo
2. **Integración IoT** con sensores de humedad y temperatura
3. **Machine Learning avanzado** con modelos entrenados específicamente
4. **Notificaciones push** en tiempo real
5. **API pública** para integraciones con terceros

---

## Anexos

### A. Glosario de Términos

| Término | Definición |
|---------|------------|
| **Enfunde** | Proceso de colocar funda protectora al racimo de banano en desarrollo |
| **Cosecha** | Corte y procesamiento de racimos maduros para exportación |
| **Ratio** | Relación entre cajas producidas y racimos cortados (ideal: >2.0) |
| **Merma** | Porcentaje de racimos rechazados por no cumplir estándares |
| **Cinta** | Marcador de color para identificar la semana de enfunde |
| **Lote** | Subdivisión geográfica de la finca (A, B, C, D, E) |
| **Stock Mínimo** | Cantidad mínima de inventario antes de generar alerta |
| **JWT** | JSON Web Token - estándar para autenticación stateless |
| **RBAC** | Role-Based Access Control - control de acceso basado en roles |

### B. Fincas del Sistema

| Finca | Hectáreas | Ubicación | Plantas |
|-------|-----------|-----------|---------|
| BABY | 45.5 | Valencia, Los Ríos | 50,000 |
| SOLO | 38.2 | Valencia, Los Ríos | 42,000 |
| LAURITA | 52.8 | Valencia, Los Ríos | 58,000 |
| MARAVILLA | 61.3 | Quevedo, Los Ríos | 67,000 |

### C. Colores de Cinta por Semana

| Semana | Color | Semana | Color |
|--------|-------|--------|-------|
| 1 | Blanco | 27 | Blanco |
| 2 | Azul | 28 | Azul |
| 3 | Rojo | 29 | Rojo |
| 4 | Verde | 30 | Verde |
| ... | ... | ... | ... |

---

*Documento elaborado como parte del Trabajo de Titulación*  
*Sistema de Gestión Integral para Operaciones Bananeras*  
*Ecuador, 2026*
