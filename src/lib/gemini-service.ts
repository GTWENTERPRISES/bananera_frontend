/**
 * Servicio de Gemini AI para el agente de notificaciones inteligente
 * Usa la API gratuita de Google Gemini
 * Consulta directamente las APIs de Django para tener contexto completo
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface GeminiConfig {
  apiKey: string;
}

export interface NotificationContext {
  insumos: any[];
  cosechas: any[];
  enfundes: any[];
  empleados: any[];
  prestamos: any[];
  recuperacionCintas: any[];
  rolesPago: any[];
  alertas: any[];
  fincas: any[];
}

export interface SmartNotification {
  id: string;
  tipo: 'critico' | 'advertencia' | 'info' | 'oportunidad';
  modulo: string;
  titulo: string;
  descripcion: string;
  accionRecomendada: string;
  prioridad: number;
  finca?: string;
  generadoPorIA: boolean;
  timestamp: string;
}

class GeminiService {
  private apiKey: string | null = null;

  setApiKey(key: string) {
    this.apiKey = key;
    if (typeof window !== 'undefined') {
      localStorage.setItem('gemini_api_key', key);
    }
  }

  getApiKey(): string | null {
    if (this.apiKey) return this.apiKey;
    if (typeof window !== 'undefined') {
      this.apiKey = localStorage.getItem('gemini_api_key');
    }
    return this.apiKey;
  }

  isConfigured(): boolean {
    return !!this.getApiKey();
  }

  /**
   * Obtiene todos los datos directamente desde las APIs de Django
   */
  async fetchDataFromBackend(): Promise<NotificationContext | null> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      console.warn('[Gemini] No hay token de autenticación');
      return null;
    }

    const headers = { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    try {
      console.log('[Gemini] Consultando APIs de Django...');
      
      const [
        insumosRes, cosechasRes, enfundesRes, empleadosRes, 
        prestamosRes, recuperacionesRes, rolesRes, alertasRes, fincasRes
      ] = await Promise.all([
        fetch(`${API_URL}/insumos/`, { headers }),
        fetch(`${API_URL}/cosechas/`, { headers }),
        fetch(`${API_URL}/enfundes/`, { headers }),
        fetch(`${API_URL}/empleados/`, { headers }),
        fetch(`${API_URL}/prestamos/`, { headers }),
        fetch(`${API_URL}/recuperaciones/`, { headers }),
        fetch(`${API_URL}/roles-pago/`, { headers }),
        fetch(`${API_URL}/alertas/`, { headers }),
        fetch(`${API_URL}/fincas/`, { headers }),
      ]);

      const insumos = insumosRes.ok ? await insumosRes.json() : [];
      const cosechas = cosechasRes.ok ? await cosechasRes.json() : [];
      const enfundes = enfundesRes.ok ? await enfundesRes.json() : [];
      const empleados = empleadosRes.ok ? await empleadosRes.json() : [];
      const prestamos = prestamosRes.ok ? await prestamosRes.json() : [];
      const recuperacionCintas = recuperacionesRes.ok ? await recuperacionesRes.json() : [];
      const rolesPago = rolesRes.ok ? await rolesRes.json() : [];
      const alertas = alertasRes.ok ? await alertasRes.json() : [];
      const fincas = fincasRes.ok ? await fincasRes.json() : [];

      console.log('[Gemini] Datos obtenidos:', {
        insumos: insumos.length,
        cosechas: cosechas.length,
        enfundes: enfundes.length,
        empleados: empleados.length,
        prestamos: prestamos.length,
        fincas: fincas.length,
      });

      return {
        insumos,
        cosechas,
        enfundes,
        empleados,
        prestamos,
        recuperacionCintas,
        rolesPago,
        alertas,
        fincas,
      };
    } catch (error) {
      console.error('[Gemini] Error obteniendo datos del backend:', error);
      return null;
    }
  }

  /**
   * Genera notificaciones consultando directamente Django
   */
  async generateNotificationsFromBackend(): Promise<SmartNotification[]> {
    const context = await this.fetchDataFromBackend();
    if (!context) {
      console.warn('[Gemini] No se pudieron obtener datos del backend');
      return [];
    }
    return this.generateNotifications(context);
  }

  async generateNotifications(context: NotificationContext): Promise<SmartNotification[]> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      console.warn('[Gemini] API key no configurada');
      return [];
    }

    const prompt = this.buildPrompt(context);

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
          ]
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('[Gemini] Error:', error);
        throw new Error(error.error?.message || 'Error en la API de Gemini');
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        console.warn('[Gemini] Respuesta vacía');
        return [];
      }

      return this.parseNotifications(text);
    } catch (error) {
      console.error('[Gemini] Error generando notificaciones:', error);
      return [];
    }
  }

  private buildPrompt(context: NotificationContext): string {
    // Analizar datos - soporta tanto snake_case (Django) como camelCase (frontend)
    const getStock = (i: any) => i.stock_actual ?? i.stockActual ?? 0;
    const getStockMin = (i: any) => i.stock_minimo ?? i.stockMinimo ?? 0;
    const getFinca = (i: any) => i.finca_nombre ?? i.finca ?? 'Sin finca';
    const getCajas = (c: any) => c.cajas_producidas ?? c.cajasProducidas ?? 0;
    const getMatasCaidas = (e: any) => e.matas_caidas ?? e.matasCaidas ?? 0;
    const getCantidadEnfundes = (e: any) => e.cantidad_enfundes ?? e.cantidadEnfundes ?? 0;
    const getPorcentajeRecuperacion = (r: any) => r.porcentaje_recuperacion ?? r.porcentajeRecuperacion ?? 0;
    const getActivo = (e: any) => e.activo ?? true;
    const getSaldoPendiente = (p: any) => p.saldo_pendiente ?? p.saldoPendiente ?? 0;

    const stockBajo = context.insumos.filter(i => getStock(i) <= getStockMin(i));
    const stockCritico = context.insumos.filter(i => getStock(i) <= getStockMin(i) * 0.5);
    
    const ultimasCosechas = context.cosechas.slice(0, 10);
    const produccionPromedio = ultimasCosechas.length > 0 
      ? ultimasCosechas.reduce((sum, c) => sum + getCajas(c), 0) / ultimasCosechas.length 
      : 0;

    const empleadosActivos = context.empleados.filter(e => getActivo(e));
    const empleadosInactivos = context.empleados.filter(e => !getActivo(e));
    const prestamosActivos = context.prestamos.filter(p => p.estado === 'activo' || p.estado === 'pendiente');
    const totalDeudaPrestamos = prestamosActivos.reduce((sum, p) => sum + getSaldoPendiente(p), 0);
    
    const recuperacionBaja = context.recuperacionCintas.filter(r => getPorcentajeRecuperacion(r) < 80);
    
    const matasCaidasTotal = context.enfundes.reduce((sum, e) => sum + getMatasCaidas(e), 0);
    const enfundesTotales = context.enfundes.reduce((sum, e) => sum + getCantidadEnfundes(e), 0);
    const porcentajeMatasCaidas = enfundesTotales > 0 ? (matasCaidasTotal / enfundesTotales) * 100 : 0;

    // Roles de pago pendientes
    const rolesPendientes = context.rolesPago.filter(r => r.estado === 'pendiente');
    const totalPorPagar = rolesPendientes.reduce((sum, r) => sum + (r.total_pagar ?? r.netoAPagar ?? 0), 0);

    // Alertas existentes del sistema
    const alertasCriticas = context.alertas.filter(a => a.prioridad === 'critica' || a.prioridad === 'alta');

    return `Eres un asistente experto en gestión de bananeras en Ecuador. Analiza los siguientes datos REALES del sistema y genera notificaciones inteligentes y accionables.

DATOS ACTUALES DEL SISTEMA (${new Date().toLocaleDateString('es-EC')}):

🏢 FINCAS REGISTRADAS: ${context.fincas.length}
${context.fincas.slice(0, 5).map((f: any) => `  • ${f.nombre}: ${f.hectareas ?? 0} hectáreas`).join('\n')}

📦 INVENTARIO:
- Total insumos: ${context.insumos.length}
- Insumos con stock bajo (≤ mínimo): ${stockBajo.length}
${stockBajo.slice(0, 5).map(i => `  • ${i.nombre}: ${getStock(i)}/${getStockMin(i)} ${i.unidad_medida ?? i.unidadMedida ?? 'unidades'} (${getFinca(i)})`).join('\n') || '  Sin alertas de stock bajo'}
- Insumos CRÍTICOS (≤ 50% del mínimo): ${stockCritico.length}
${stockCritico.slice(0, 3).map(i => `  ⚠️ ${i.nombre}: SOLO ${getStock(i)} unidades (${getFinca(i)})`).join('\n') || '  Sin alertas críticas'}

🍌 PRODUCCIÓN - COSECHAS:
- Total cosechas registradas: ${context.cosechas.length}
- Producción promedio: ${produccionPromedio.toFixed(0)} cajas/cosecha
${ultimasCosechas.slice(0, 5).map(c => `  • Semana ${c.semana}: ${getCajas(c)} cajas - ${getFinca(c)}`).join('\n') || '  Sin datos de cosechas'}

🌱 ENFUNDES:
- Total registros: ${context.enfundes.length}
- Total enfundes realizados: ${enfundesTotales.toLocaleString()}
- Matas caídas: ${matasCaidasTotal.toLocaleString()} (${porcentajeMatasCaidas.toFixed(1)}% del total)
${porcentajeMatasCaidas > 3 ? '  ⚠️ ALERTA: Porcentaje de matas caídas superior al 3% recomendado' : ''}

🎗️ RECUPERACIÓN DE CINTAS:
- Total registros: ${context.recuperacionCintas.length}
- Con recuperación < 80%: ${recuperacionBaja.length}
${recuperacionBaja.slice(0, 3).map(r => `  • ${r.finca_nombre ?? r.fincaNombre ?? 'Finca'}: ${getPorcentajeRecuperacion(r).toFixed(1)}%`).join('\n') || '  Todas las recuperaciones están en rango óptimo'}

👷 PERSONAL Y NÓMINA:
- Empleados activos: ${empleadosActivos.length}
- Empleados inactivos: ${empleadosInactivos.length}
- Roles de pago pendientes: ${rolesPendientes.length} (Total: $${totalPorPagar.toLocaleString()})
- Préstamos activos: ${prestamosActivos.length} (Deuda total: $${totalDeudaPrestamos.toLocaleString()})

🔔 ALERTAS DEL SISTEMA:
- Alertas críticas/altas activas: ${alertasCriticas.length}
${alertasCriticas.slice(0, 3).map((a: any) => `  • ${a.titulo}: ${a.mensaje ?? a.descripcion ?? ''}`).join('\n') || '  Sin alertas críticas'}

INSTRUCCIONES:
1. Genera entre 3 y 6 notificaciones basadas en los problemas MÁS IMPORTANTES detectados
2. PRIORIZA: Stock crítico > Producción baja > Pagos pendientes > Recuperación baja
3. Incluye recomendaciones ESPECÍFICAS y ACCIONABLES
4. Si no hay problemas graves, genera oportunidades de mejora
5. Menciona fincas específicas cuando aplique

FORMATO DE RESPUESTA (JSON array estricto):
[
  {
    "tipo": "critico|advertencia|info|oportunidad",
    "modulo": "inventario|produccion|nomina|sistema",
    "titulo": "Título corto y claro",
    "descripcion": "Descripción detallada con datos específicos",
    "accionRecomendada": "Acción específica que debe tomar el usuario",
    "prioridad": 1-10,
    "finca": "Nombre de finca o null si es general"
  }
]

Responde SOLO con el JSON array válido, sin texto adicional, sin markdown, sin explicaciones.`;
  }

  private parseNotifications(text: string): SmartNotification[] {
    try {
      // Limpiar el texto de posibles caracteres extra
      let cleanText = text.trim();
      
      // Remover markdown si existe
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json\n?/, '').replace(/```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```\n?/, '').replace(/```$/, '');
      }
      
      const parsed = JSON.parse(cleanText);
      
      if (!Array.isArray(parsed)) {
        console.warn('[Gemini] Respuesta no es un array');
        return [];
      }

      return parsed.map((item: any, index: number) => ({
        id: `gemini-${Date.now()}-${index}`,
        tipo: item.tipo || 'info',
        modulo: item.modulo || 'sistema',
        titulo: item.titulo || 'Notificación',
        descripcion: item.descripcion || '',
        accionRecomendada: item.accionRecomendada || '',
        prioridad: item.prioridad || 5,
        finca: item.finca || undefined,
        generadoPorIA: true,
        timestamp: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('[Gemini] Error parseando respuesta:', error, text);
      return [];
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, message: 'API key no configurada' };
    }

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Responde solo con: OK' }] }],
          generationConfig: { maxOutputTokens: 10 }
        }),
      });

      if (response.ok) {
        return { success: true, message: 'Conexión exitosa con Gemini AI' };
      } else {
        const error = await response.json();
        return { success: false, message: error.error?.message || 'Error de conexión' };
      }
    } catch (error) {
      return { success: false, message: 'Error de red al conectar con Gemini' };
    }
  }
}

export const geminiService = new GeminiService();
