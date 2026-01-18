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
import { Badge } from "@/src/components/ui/badge";
import {
  X,
  Sprout,
  Wallet,
  Package,
  FileText,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";
import { useApp } from "@/src/contexts/app-context";
import { useRouter } from "next/navigation";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  roles: string[];
}

const quickActions: QuickAction[] = [
  {
    id: "enfunde",
    title: "Registrar Enfunde",
    description: "Agrega los enfundes de la semana",
    href: "/produccion/enfundes",
    icon: Sprout,
    color: "bg-green-500/10 text-green-600 dark:text-green-400",
    roles: ["administrador", "gerente", "supervisor_finca"],
  },
  {
    id: "cosecha",
    title: "Registrar Cosecha",
    description: "Ingresa la producción semanal",
    href: "/produccion/cosechas",
    icon: Sprout,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    roles: ["administrador", "gerente", "supervisor_finca"],
  },
  {
    id: "nomina",
    title: "Generar Nómina",
    description: "Calcula los pagos de la semana",
    href: "/nomina/roles",
    icon: Wallet,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    roles: ["administrador", "contador_rrhh"],
  },
  {
    id: "inventario",
    title: "Revisar Inventario",
    description: "Verifica el stock de insumos",
    href: "/inventario/alertas",
    icon: Package,
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    roles: ["administrador", "gerente", "bodeguero"],
  },
  {
    id: "reportes",
    title: "Ver Reportes",
    description: "Consulta el resumen ejecutivo",
    href: "/reportes",
    icon: FileText,
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    roles: ["administrador", "gerente", "contador_rrhh"],
  },
];

export function QuickStartGuide() {
  const { currentUser } = useApp();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [completedActions, setCompletedActions] = useState<string[]>([]);

  useEffect(() => {
    // Check if guide was dismissed
    const dismissed = localStorage.getItem("quickStartDismissed");
    const completed = localStorage.getItem("quickStartCompleted");
    
    if (!dismissed) {
      setIsVisible(true);
    }
    if (completed) {
      setCompletedActions(JSON.parse(completed));
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("quickStartDismissed", "true");
    setIsVisible(false);
  };

  const handleAction = (action: QuickAction) => {
    // Mark action as completed
    const newCompleted = [...completedActions, action.id];
    setCompletedActions(newCompleted);
    localStorage.setItem("quickStartCompleted", JSON.stringify(newCompleted));
    
    // Navigate to the action
    router.push(action.href);
  };

  const visibleActions = quickActions.filter(
    (action) => action.roles.includes(currentUser?.rol || "")
  );

  if (!isVisible || visibleActions.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                ¡Hola, {currentUser?.nombre?.split(" ")[0]}! 👋
              </CardTitle>
              <CardDescription>
                Acciones rápidas para comenzar tu día
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {visibleActions.map((action) => {
            const Icon = action.icon;
            const isCompleted = completedActions.includes(action.id);
            
            return (
              <button
                key={action.id}
                onClick={() => handleAction(action)}
                className={`group relative flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-all hover:border-primary/50 hover:shadow-md ${
                  isCompleted ? "border-green-500/30 bg-green-500/5" : ""
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <div className={`rounded-lg p-2 ${action.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{action.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
        
        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <p className="text-xs text-muted-foreground">
            💡 Tip: Usa el menú lateral para navegar entre módulos
          </p>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs"
            onClick={handleDismiss}
          >
            No mostrar de nuevo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
