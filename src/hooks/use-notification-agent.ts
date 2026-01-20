"use client";

import { useState, useCallback, useEffect } from 'react';
import { geminiService, SmartNotification } from '@/src/lib/gemini-service';

interface UseNotificationAgentReturn {
  notifications: SmartNotification[];
  isLoading: boolean;
  error: string | null;
  isConfigured: boolean;
  lastUpdated: Date | null;
  generateNotifications: () => Promise<void>;
  configureApiKey: (apiKey: string) => Promise<{ success: boolean; message: string }>;
  clearNotifications: () => void;
}

export function useNotificationAgent(): UseNotificationAgentReturn {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Verificar si la API está configurada al montar
  useEffect(() => {
    setIsConfigured(geminiService.isConfigured());
    
    // Cargar notificaciones guardadas si existen
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smart_notifications');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setNotifications(parsed.notifications || []);
          setLastUpdated(parsed.lastUpdated ? new Date(parsed.lastUpdated) : null);
        } catch (e) {
          console.error('Error loading saved notifications:', e);
        }
      }
    }
  }, []);

  // Guardar notificaciones cuando cambien
  useEffect(() => {
    if (typeof window !== 'undefined' && notifications.length > 0) {
      localStorage.setItem('smart_notifications', JSON.stringify({
        notifications,
        lastUpdated: lastUpdated?.toISOString()
      }));
    }
  }, [notifications, lastUpdated]);

  /**
   * Genera notificaciones consultando DIRECTAMENTE las APIs de Django
   * para tener el contexto completo y actualizado
   */
  const generateNotifications = useCallback(async () => {
    if (!geminiService.isConfigured()) {
      setError('API de Gemini no configurada. Ve a Configuración > Agente IA');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[NotificationAgent] Consultando APIs de Django directamente...');
      
      // Usar el nuevo método que consulta Django directamente
      const newNotifications = await geminiService.generateNotificationsFromBackend();
      
      if (newNotifications.length > 0) {
        setNotifications(newNotifications);
        setLastUpdated(new Date());
        console.log('[NotificationAgent] Notificaciones generadas:', newNotifications.length);
      } else {
        setError('No se generaron notificaciones. Verifica que haya datos en el sistema.');
      }
    } catch (err) {
      console.error('[NotificationAgent] Error:', err);
      setError(err instanceof Error ? err.message : 'Error generando notificaciones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const configureApiKey = useCallback(async (apiKey: string): Promise<{ success: boolean; message: string }> => {
    geminiService.setApiKey(apiKey);
    const result = await geminiService.testConnection();
    setIsConfigured(result.success);
    
    if (!result.success) {
      geminiService.setApiKey(''); // Limpiar si falla
    }
    
    return result;
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setLastUpdated(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('smart_notifications');
    }
  }, []);

  return {
    notifications,
    isLoading,
    error,
    isConfigured,
    lastUpdated,
    generateNotifications,
    configureApiKey,
    clearNotifications,
  };
}
