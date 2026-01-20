"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { Switch } from "@/src/components/ui/switch";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import {
  Bot,
  Key,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  Info,
  Lightbulb,
  ExternalLink,
  Trash2,
  Clock,
} from "lucide-react";
import { useNotificationAgent } from "@/src/hooks/use-notification-agent";
import { geminiService } from "@/src/lib/gemini-service";
import { cn } from "@/src/lib/utils";

export default function AgenteIAPage() {
  const {
    notifications,
    isLoading,
    error,
    isConfigured,
    lastUpdated,
    generateNotifications,
    configureApiKey,
    clearNotifications,
  } = useNotificationAgent();

  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [autoGenerate, setAutoGenerate] = useState(false);

  useEffect(() => {
    // Cargar API key guardada (solo mostrar asteriscos)
    if (geminiService.isConfigured()) {
      setApiKey("••••••••••••••••••••••••••••••••");
    }
  }, []);

  const handleSaveApiKey = async () => {
    if (!apiKey || apiKey.includes("•")) {
      setTestResult({ success: false, message: "Ingresa una API key válida" });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const result = await configureApiKey(apiKey);
    setTestResult(result);
    setIsTesting(false);

    if (result.success) {
      setApiKey("••••••••••••••••••••••••••••••••");
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const result = await geminiService.testConnection();
    setTestResult(result);
    setIsTesting(false);
  };

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case "critico":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case "advertencia":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "oportunidad":
        return <Lightbulb className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationBadge = (tipo: string) => {
    switch (tipo) {
      case "critico":
        return <Badge variant="destructive">Crítico</Badge>;
      case "advertencia":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Advertencia</Badge>;
      case "oportunidad":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Oportunidad</Badge>;
      default:
        return <Badge variant="outline">Info</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <Bot className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Agente de Notificaciones IA</h1>
          <p className="text-muted-foreground">
            Configuración del asistente inteligente con Google Gemini
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Configuración de API */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Configuración de API
            </CardTitle>
            <CardDescription>
              Conecta tu cuenta de Google Gemini para habilitar notificaciones inteligentes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key de Gemini</Label>
              <div className="flex gap-2">
                <Input
                  id="apiKey"
                  type={showKey ? "text" : "password"}
                  placeholder="AIza..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? "🙈" : "👁️"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Obtén tu API key gratis en{" "}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Google AI Studio <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveApiKey} disabled={isTesting}>
                {isTesting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Key className="mr-2 h-4 w-4" />
                )}
                Guardar y Probar
              </Button>
              {isConfigured && (
                <Button variant="outline" onClick={handleTestConnection} disabled={isTesting}>
                  <RefreshCw className={cn("mr-2 h-4 w-4", isTesting && "animate-spin")} />
                  Probar Conexión
                </Button>
              )}
            </div>

            {testResult && (
              <div
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg",
                  testResult.success
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                )}
              >
                {testResult.success ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
                <span className="text-sm">{testResult.message}</span>
              </div>
            )}

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Estado del Agente</Label>
                  <p className="text-xs text-muted-foreground">
                    {isConfigured ? "Listo para generar notificaciones" : "Requiere configuración"}
                  </p>
                </div>
                <Badge variant={isConfigured ? "default" : "secondary"}>
                  {isConfigured ? (
                    <>
                      <CheckCircle className="mr-1 h-3 w-3" /> Activo
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-1 h-3 w-3" /> Inactivo
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generación de Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Generar Notificaciones
            </CardTitle>
            <CardDescription>
              Analiza los datos actuales y genera alertas inteligentes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Generación automática</Label>
                <p className="text-xs text-muted-foreground">
                  Generar al cargar el dashboard (próximamente)
                </p>
              </div>
              <Switch
                checked={autoGenerate}
                onCheckedChange={setAutoGenerate}
                disabled
              />
            </div>

            {lastUpdated && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Última actualización: {lastUpdated.toLocaleString()}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={generateNotifications}
                disabled={!isConfigured || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {isLoading ? "Analizando datos..." : "Generar Notificaciones"}
              </Button>
              {notifications.length > 0 && (
                <Button variant="outline" size="icon" onClick={clearNotifications}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                <XCircle className="h-5 w-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {!isConfigured && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm">Configura tu API key primero</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notificaciones Generadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Notificaciones Inteligentes
            </span>
            {notifications.length > 0 && (
              <Badge variant="outline">{notifications.length} alertas</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Alertas y recomendaciones generadas por el agente de IA basadas en los datos del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay notificaciones generadas</p>
              <p className="text-sm">
                Haz clic en "Generar Notificaciones" para analizar los datos
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {notifications
                  .sort((a, b) => b.prioridad - a.prioridad)
                  .map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 rounded-lg border",
                        notification.tipo === "critico" && "border-destructive/50 bg-destructive/5",
                        notification.tipo === "advertencia" && "border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-900/10",
                        notification.tipo === "oportunidad" && "border-green-500/50 bg-green-50/50 dark:bg-green-900/10",
                        notification.tipo === "info" && "border-blue-500/50 bg-blue-50/50 dark:bg-blue-900/10"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.tipo)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="font-semibold">{notification.titulo}</h4>
                            {getNotificationBadge(notification.tipo)}
                            <Badge variant="outline" className="text-xs">
                              {notification.modulo}
                            </Badge>
                            {notification.finca && (
                              <Badge variant="secondary" className="text-xs">
                                {notification.finca}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.descripcion}
                          </p>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-primary">Acción:</span>
                            <span>{notification.accionRecomendada}</span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Prioridad: {notification.prioridad}/10
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle>¿Cómo funciona?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <span className="text-lg">1️⃣</span>
              </div>
              <div>
                <h4 className="font-medium">Recopilación de Datos</h4>
                <p className="text-sm text-muted-foreground">
                  El agente analiza inventario, producción, empleados y más
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <span className="text-lg">2️⃣</span>
              </div>
              <div>
                <h4 className="font-medium">Análisis Inteligente</h4>
                <p className="text-sm text-muted-foreground">
                  Gemini procesa los datos y detecta patrones o problemas
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <span className="text-lg">3️⃣</span>
              </div>
              <div>
                <h4 className="font-medium">Notificaciones Accionables</h4>
                <p className="text-sm text-muted-foreground">
                  Recibe alertas con recomendaciones específicas
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
