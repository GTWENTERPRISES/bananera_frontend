# 🤖 Agente de Notificaciones Inteligente con Gemini AI

## Descripción General

El sistema integra un agente de inteligencia artificial que analiza los datos de la bananera en tiempo real y genera notificaciones inteligentes con recomendaciones accionables. Utiliza la API gratuita de **Google Gemini** para el procesamiento de lenguaje natural.

---

## 📁 Arquitectura de Archivos

```
src/
├── lib/
│   └── gemini-service.ts      # Servicio principal de conexión con Gemini
├── hooks/
│   └── use-notification-agent.ts  # Hook React para gestionar el agente
├── app/(dashboard)/configuracion/
│   └── agente-ia/
│       └── page.tsx           # Página de configuración del agente
└── components/layout/
    └── app-header.tsx         # Header con botón del agente (icono Bot)
```

---

## 🔄 Flujo de Funcionamiento

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FLUJO DEL AGENTE DE NOTIFICACIONES               │
└─────────────────────────────────────────────────────────────────────┘

1. Usuario hace clic en "Generar Notificaciones" o botón 🤖 en header
                              │
                              ▼
2. Hook useNotificationAgent() llama generateNotifications()
                              │
                              ▼
3. geminiService.generateNotificationsFromBackend()
                              │
                              ▼
4. fetchDataFromBackend() consulta APIs de Django en PARALELO:
   ┌──────────────────────────────────────────────────────────┐
   │  GET /api/insumos/          → Inventario                 │
   │  GET /api/cosechas/         → Producción                 │
   │  GET /api/enfundes/         → Enfundes y matas caídas    │
   │  GET /api/empleados/        → Personal                   │
   │  GET /api/prestamos/        → Préstamos activos          │
   │  GET /api/recuperaciones/   → Recuperación de cintas     │
   │  GET /api/roles-pago/       → Nómina pendiente           │
   │  GET /api/alertas/          → Alertas del sistema        │
   │  GET /api/fincas/           → Información de fincas      │
   └──────────────────────────────────────────────────────────┘
                              │
                              ▼
5. buildPrompt() procesa los datos y construye el prompt:
   - Detecta stock bajo/crítico
   - Calcula promedios de producción
   - Identifica matas caídas elevadas
   - Verifica recuperación de cintas
   - Revisa roles de pago pendientes
   - Lista alertas críticas existentes
                              │
                              ▼
6. Envío a Gemini API (generativelanguage.googleapis.com)
   - Modelo: gemini-1.5-flash
   - Temperature: 0.3 (respuestas consistentes)
   - Max tokens: 2048
                              │
                              ▼
7. parseNotifications() convierte la respuesta JSON en objetos
                              │
                              ▼
8. Notificaciones se guardan en localStorage y se muestran en UI
```

---

## 🔧 Componentes Principales

### 1. GeminiService (`src/lib/gemini-service.ts`)

Servicio singleton que maneja toda la comunicación con Gemini y Django.

```typescript
// Métodos principales
geminiService.setApiKey(key)              // Configurar API key
geminiService.isConfigured()              // Verificar si está listo
geminiService.testConnection()            // Probar conexión
geminiService.fetchDataFromBackend()      // Obtener datos de Django
geminiService.generateNotificationsFromBackend()  // Flujo completo
```

**Características:**
- API key se guarda en `localStorage` (clave: `gemini_api_key`)
- Consulta 9 endpoints de Django en paralelo para eficiencia
- Soporta campos en `snake_case` (Django) y `camelCase` (frontend)
- Manejo robusto de errores y respuestas vacías

### 2. useNotificationAgent Hook (`src/hooks/use-notification-agent.ts`)

Hook React que expone el agente a los componentes.

```typescript
const {
  notifications,        // SmartNotification[] - Lista de alertas IA
  isLoading,           // boolean - Estado de carga
  error,               // string | null - Mensaje de error
  isConfigured,        // boolean - Si Gemini está configurado
  lastUpdated,         // Date | null - Última actualización
  generateNotifications,  // () => Promise<void> - Generar alertas
  configureApiKey,     // (key) => Promise<{success, message}>
  clearNotifications,  // () => void - Limpiar alertas
} = useNotificationAgent();
```

**Persistencia:**
- Notificaciones se guardan en `localStorage` (clave: `smart_notifications`)
- Se cargan automáticamente al montar el hook

### 3. Página de Configuración (`src/app/(dashboard)/configuracion/agente-ia/page.tsx`)

Interfaz completa para:
- Configurar API key de Gemini
- Probar conexión
- Generar notificaciones manualmente
- Ver historial de alertas generadas
- Limpiar notificaciones

### 4. Header Integration (`src/components/layout/app-header.tsx`)

Botón con icono 🤖 (Bot) que:
- Muestra badge con cantidad de notificaciones IA
- Dropdown con las últimas 5 alertas
- Botón "Actualizar" para regenerar
- Link a configuración si no está configurado

---

## 📊 Estructura de Notificación

```typescript
interface SmartNotification {
  id: string;                    // ID único (gemini-{timestamp}-{index})
  tipo: 'critico' | 'advertencia' | 'info' | 'oportunidad';
  modulo: 'inventario' | 'produccion' | 'nomina' | 'sistema';
  titulo: string;                // Título corto
  descripcion: string;           // Descripción detallada
  accionRecomendada: string;     // Qué debe hacer el usuario
  prioridad: number;             // 1-10 (10 = más urgente)
  finca?: string;                // Finca específica si aplica
  generadoPorIA: boolean;        // Siempre true
  timestamp: string;             // ISO date de generación
}
```

---

## 🔑 Configuración de API Key

### Obtener API Key (Gratis)

1. Ir a [Google AI Studio](https://aistudio.google.com/apikey)
2. Iniciar sesión con cuenta Google
3. Crear nueva API key
4. Copiar y pegar en Configuración > Agente IA

### Límites de la API Gratuita

| Límite | Valor |
|--------|-------|
| Requests por minuto | 60 |
| Requests por día | 1,500 |
| Tokens por minuto | 1,000,000 |

**Nota:** Más que suficiente para uso normal del agente.

---

## 🧠 Lógica del Prompt

El prompt enviado a Gemini incluye:

### Datos Analizados
1. **Fincas** - Nombre y hectáreas
2. **Inventario** - Stock actual vs mínimo, insumos críticos
3. **Cosechas** - Producción promedio, cajas por semana
4. **Enfundes** - Total realizado, matas caídas (%)
5. **Recuperación** - Porcentaje por finca
6. **Personal** - Activos/inactivos, roles pendientes
7. **Préstamos** - Deuda total activa
8. **Alertas existentes** - Del sistema base

### Priorización
El agente prioriza en este orden:
1. Stock crítico (≤50% del mínimo)
2. Producción anormalmente baja
3. Pagos de nómina pendientes
4. Recuperación de cintas baja (<80%)
5. Matas caídas elevadas (>3%)

### Formato de Respuesta
Gemini responde SOLO con JSON array válido, sin markdown ni texto adicional.

---

## 🎨 Integración Visual

### Colores por Tipo
| Tipo | Color | Icono |
|------|-------|-------|
| crítico | Rojo (destructive) | AlertCircle |
| advertencia | Amarillo | AlertTriangle |
| info | Azul | Info |
| oportunidad | Verde | Lightbulb |

### Ubicaciones en UI
1. **Header** - Dropdown con icono Bot
2. **Configuración > Agente IA** - Panel completo
3. **Notificaciones** - Integrado con alertas del sistema

---

## 🔒 Seguridad

- API key se almacena solo en `localStorage` del navegador
- Nunca se envía al backend de Django
- Token JWT de Django se usa para autenticar las consultas a las APIs
- Gemini no almacena los datos enviados (política de Google AI)

---

## 🚀 Uso Recomendado

1. **Configurar una vez** la API key de Gemini
2. **Generar al inicio del día** para revisar estado general
3. **Regenerar** después de operaciones importantes (cosechas, movimientos de inventario)
4. **Revisar alertas críticas** inmediatamente
5. **Usar acciones recomendadas** como guía para priorizar tareas

---

## 📝 Ejemplos de Notificaciones Generadas

### Crítico
```json
{
  "tipo": "critico",
  "modulo": "inventario",
  "titulo": "Stock de Fertilizante Agotándose",
  "descripcion": "El fertilizante NPK en Finca Aurora tiene solo 15 unidades, cuando el mínimo es 50. A este ritmo se agotará en 3-4 días.",
  "accionRecomendada": "Generar orden de compra urgente para al menos 100 unidades de fertilizante NPK.",
  "prioridad": 9,
  "finca": "Aurora"
}
```

### Advertencia
```json
{
  "tipo": "advertencia",
  "modulo": "produccion",
  "titulo": "Recuperación de Cintas Baja",
  "descripcion": "La Finca Central muestra 68% de recuperación de cintas, por debajo del objetivo del 80%.",
  "accionRecomendada": "Revisar proceso de recolección y capacitar al personal sobre importancia de recuperación.",
  "prioridad": 6,
  "finca": "Central"
}
```

### Oportunidad
```json
{
  "tipo": "oportunidad",
  "modulo": "produccion",
  "titulo": "Producción en Tendencia Positiva",
  "descripcion": "La producción ha aumentado 12% en las últimas 4 semanas. Finca Aurora lidera con 2,500 cajas/semana.",
  "accionRecomendada": "Analizar prácticas de Finca Aurora para replicar en otras fincas.",
  "prioridad": 4,
  "finca": null
}
```

---

## 🛠️ Troubleshooting

| Problema | Solución |
|----------|----------|
| "API key no configurada" | Ir a Configuración > Agente IA y guardar key |
| "Error de conexión" | Verificar internet y que la key sea válida |
| "No se generaron notificaciones" | Verificar que Django esté corriendo y haya datos |
| "Respuesta vacía de Gemini" | Puede ser rate limiting, esperar 1 minuto |
| Notificaciones no aparecen en header | Refrescar la página después de generar |

---

## 📚 Referencias

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [API Pricing](https://ai.google.dev/pricing) - Tier gratuito incluido
- [Gemini Models](https://ai.google.dev/models/gemini) - Usamos gemini-1.5-flash

---

*Documentación generada para el Sistema de Gestión Bananera - Módulo de IA*
