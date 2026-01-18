# Product Requirements Document (PRD)
## Sistema de Gestión Bananera HG

**Versión:** 1.0  
**Fecha:** Enero 2026  
**Estado:** En Desarrollo  

---

## 1. Resumen Ejecutivo

### 1.1 Visión del Producto
Sistema integral de gestión para operaciones bananeras que permite el control de producción, inventario, nómina y análisis predictivo mediante inteligencia artificial.

### 1.2 Objetivo
Digitalizar y optimizar la gestión operativa de fincas bananeras, proporcionando visibilidad en tiempo real de la producción, control de inventarios, gestión de personal y proyecciones basadas en datos históricos.

### 1.3 Usuarios Objetivo
- **Administradores**: Control total del sistema
- **Gerentes**: Análisis y reportes ejecutivos
- **Supervisores de Finca**: Gestión operativa diaria
- **Contadores/RRHH**: Nómina y roles de pago
- **Bodegueros**: Control de inventario

---

## 2. Alcance del Producto

### 2.1 Módulos Principales

#### 2.1.1 Dashboard Principal
- Vista general de métricas clave
- Producción semanal por finca
- Alertas de inventario
- Indicadores de rendimiento (KPIs)

#### 2.1.2 Producción
| Funcionalidad | Descripción | Prioridad |
|---------------|-------------|-----------|
| Registro de Enfundes | Captura de enfundes por finca, semana, color de cinta | Alta |
| Registro de Cosechas | Racimos, cajas producidas, ratio, merma | Alta |
| Recuperación de Cintas | Control de cintas recuperadas vs utilizadas | Media |
| Mapa de Productividad | Heatmap por lotes de cada finca | Media |

#### 2.1.3 Inventario
| Funcionalidad | Descripción | Prioridad |
|---------------|-------------|-----------|
| Catálogo de Insumos | CRUD de insumos con categorías | Alta |
| Control de Stock | Stock actual, mínimo, máximo | Alta |
| Alertas de Stock Bajo | Notificaciones cuando stock < mínimo | Alta |
| Movimientos | Registro de entradas/salidas | Alta |
| Vencimientos | Control de fechas de vencimiento | Media |

#### 2.1.4 Nómina
| Funcionalidad | Descripción | Prioridad |
|---------------|-------------|-----------|
| Gestión de Empleados | CRUD de empleados por finca | Alta |
| Roles de Pago | Cálculo de salarios, bonificaciones, descuentos | Alta |
| Préstamos | Registro y seguimiento de préstamos | Media |
| Reportes de Nómina | Exportación a PDF/Excel | Media |

#### 2.1.5 Reportes y Analytics
| Funcionalidad | Descripción | Prioridad |
|---------------|-------------|-----------|
| Dashboard de Reportes | Gráficos interactivos de producción | Alta |
| Comparativa de Fincas | Análisis comparativo entre fincas | Alta |
| Filtros Temporales | Semanal, Mensual, Anual | Alta |
| Exportación | PDF, Excel, CSV | Media |

#### 2.1.6 Analytics Predictivo (IA)
| Funcionalidad | Descripción | Prioridad |
|---------------|-------------|-----------|
| Proyección de Producción | Estimación basada en históricos | Alta |
| Proyección de Precios | Tendencias de mercado | Media |
| Análisis de Riesgos | Factores climáticos, plagas, mercado | Media |
| Recomendaciones | Sugerencias basadas en datos | Media |
| Filtros de Confianza | Baja, Media, Alta | Media |
| Período de Proyección | 1, 3, 6, 12 meses | Media |

---

## 3. Requisitos Funcionales

### 3.1 Autenticación y Autorización
- **RF-001**: Login con email/contraseña
- **RF-002**: Roles de usuario con permisos diferenciados
- **RF-003**: Sesiones con JWT tokens
- **RF-004**: Logout y expiración de sesión

### 3.2 Gestión de Fincas
- **RF-010**: CRUD de fincas con geolocalización
- **RF-011**: Asignación de lotes (A, B, C, D, E) por finca
- **RF-012**: Visualización en mapa interactivo

### 3.3 Producción
- **RF-020**: Registro de enfundes con validación de semana/año
- **RF-021**: Registro de cosechas con cálculo automático de ratio y merma
- **RF-022**: Distribución de cajas por lote
- **RF-023**: Heatmap de productividad por lote

### 3.4 Inventario
- **RF-030**: CRUD de insumos con categorías predefinidas
- **RF-031**: Alertas automáticas cuando stock_actual < stock_minimo
- **RF-032**: Registro de movimientos (entrada/salida)
- **RF-033**: Control de vencimientos con alertas

### 3.5 Nómina
- **RF-040**: CRUD de empleados con asignación a finca
- **RF-041**: Generación de roles de pago con cálculos automáticos
- **RF-042**: Gestión de préstamos con cuotas
- **RF-043**: Exportación de reportes

### 3.6 Reportes
- **RF-050**: Filtrado por año, período (semanal/mensual/anual)
- **RF-051**: Gráficos de producción por finca
- **RF-052**: Tendencias de producción
- **RF-053**: Comparativa entre fincas
- **RF-054**: Exportación a PDF/Excel

### 3.7 Analytics Predictivo
- **RF-060**: Cálculo de proyecciones basado en datos históricos
- **RF-061**: Ajuste de proyecciones por período (1-12 meses)
- **RF-062**: Ajuste de proyecciones por nivel de confianza
- **RF-063**: Generación de insights dinámicos
- **RF-064**: Recomendaciones basadas en métricas reales

---

## 4. Requisitos No Funcionales

### 4.1 Rendimiento
- **RNF-001**: Tiempo de carga inicial < 3 segundos
- **RNF-002**: Respuesta de API < 500ms
- **RNF-003**: Soporte para 50 usuarios concurrentes

### 4.2 Seguridad
- **RNF-010**: Autenticación JWT con refresh tokens
- **RNF-011**: HTTPS obligatorio en producción
- **RNF-012**: Validación de permisos por rol
- **RNF-013**: Sanitización de inputs

### 4.3 Usabilidad
- **RNF-020**: Interfaz responsive (desktop, tablet, móvil)
- **RNF-021**: Modo oscuro/claro
- **RNF-022**: Navegación intuitiva con sidebar
- **RNF-023**: Feedback visual en acciones

### 4.4 Disponibilidad
- **RNF-030**: Uptime 99.5%
- **RNF-031**: Backups diarios de base de datos

---

## 5. Arquitectura Técnica

### 5.1 Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Estilos** | TailwindCSS, shadcn/ui |
| **Gráficos** | Recharts |
| **Mapas** | Leaflet |
| **Backend** | Django 5, Django REST Framework |
| **Base de Datos** | PostgreSQL + PostGIS |
| **Autenticación** | JWT (Simple JWT) |

### 5.2 Estructura del Frontend
```
src/
├── app/                    # Rutas (App Router)
│   ├── (auth)/            # Páginas públicas
│   └── (dashboard)/       # Páginas protegidas
├── components/            # Componentes React
│   ├── dashboard/         # Componentes del dashboard
│   ├── produccion/        # Enfundes, cosechas
│   ├── inventario/        # Insumos, movimientos
│   ├── nomina/            # Empleados, roles
│   └── reportes/          # Gráficos, analytics
├── contexts/              # React Context (estado global)
├── hooks/                 # Custom hooks
└── lib/                   # Utilidades, API client
```

### 5.3 API Endpoints

| Módulo | Endpoint | Métodos |
|--------|----------|---------|
| Auth | `/api/usuarios/login/` | POST |
| Fincas | `/api/fincas/` | GET, POST, PUT, DELETE |
| Enfundes | `/api/enfundes/` | GET, POST, PUT, DELETE |
| Cosechas | `/api/cosechas/` | GET, POST, PUT, DELETE |
| Empleados | `/api/empleados/` | GET, POST, PUT, DELETE |
| Insumos | `/api/insumos/` | GET, POST, PUT, DELETE |
| Movimientos | `/api/movimientos-inventario/` | GET, POST |
| Roles Pago | `/api/roles-pago/` | GET, POST, PUT, DELETE |
| Préstamos | `/api/prestamos/` | GET, POST, PUT, DELETE |

---

## 6. Fincas del Sistema

| Finca | Hectáreas | Ubicación | Plantas |
|-------|-----------|-----------|---------|
| BABY | 45.5 | Valencia / Los Ríos | 50,000 |
| SOLO | 38.2 | Valencia / Los Ríos | 42,000 |
| LAURITA | 52.8 | Valencia / Los Ríos | 58,000 |
| MARAVILLA | 61.3 | Quevedo / Los Ríos | 67,000 |

---

## 7. Roles y Permisos

| Rol | Dashboard | Producción | Inventario | Nómina | Reportes | Analytics | Admin |
|-----|-----------|------------|------------|--------|----------|-----------|-------|
| Administrador | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Gerente | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Supervisor Finca | ✅* | ✅* | 👁️ | ❌ | ✅* | ✅* | ❌ |
| Contador/RRHH | ✅ | 👁️ | 👁️ | ✅ | ✅ | ❌ | ❌ |
| Bodeguero | ✅ | ❌ | ✅* | ❌ | ❌ | ❌ | ❌ |

*Solo su finca asignada | 👁️ Solo lectura

---

## 8. Métricas de Éxito (KPIs)

| Métrica | Objetivo | Medición |
|---------|----------|----------|
| Adopción | 100% usuarios activos | Logins mensuales |
| Precisión datos | < 2% errores | Auditorías |
| Tiempo registro | < 5 min/registro | Promedio |
| Alertas atendidas | > 90% en 24h | Resolución |
| Proyección precisión | ±10% | Comparativa real vs proyectado |

---

## 9. Roadmap

### Fase 1 - MVP (Completado) ✅
- [x] Autenticación y roles
- [x] CRUD de fincas
- [x] Registro de enfundes y cosechas
- [x] Gestión de inventario
- [x] Alertas de stock bajo
- [x] Nómina básica

### Fase 2 - Analytics (En Progreso) 🔄
- [x] Dashboard de reportes
- [x] Filtros temporales funcionales
- [x] Comparativa de fincas
- [x] Heatmap de productividad
- [x] Analytics predictivo con filtros
- [x] Insights dinámicos basados en datos

### Fase 3 - Optimización (Próximo)
- [ ] Notificaciones push
- [ ] App móvil nativa
- [ ] Integración con sensores IoT
- [ ] Machine Learning avanzado
- [ ] Exportación automatizada

### Fase 4 - Escalabilidad
- [ ] Multi-tenant
- [ ] API pública
- [ ] Marketplace de integraciones

---

## 10. Glosario

| Término | Definición |
|---------|------------|
| **Enfunde** | Proceso de colocar funda protectora al racimo de banano |
| **Cosecha** | Corte y procesamiento de racimos maduros |
| **Ratio** | Relación cajas producidas / racimos cortados |
| **Merma** | Porcentaje de racimos rechazados |
| **Cinta** | Marcador de color para identificar semana de enfunde |
| **Lote** | Subdivisión de la finca (A, B, C, D, E) |
| **Stock Mínimo** | Cantidad mínima de inventario antes de alerta |

---

## 11. Contacto

**Producto**: Sistema de Gestión Bananera HG  
**Empresa**: Bananera HG  
**Ubicación**: Los Ríos, Ecuador

---

*Documento generado automáticamente - Enero 2026*
