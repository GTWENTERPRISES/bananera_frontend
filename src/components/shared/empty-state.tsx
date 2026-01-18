"use client";

import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import {
  FileText,
  Users,
  Package,
  Sprout,
  BarChart3,
  Plus,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface EmptyStateProps {
  type?: "no-data" | "no-results" | "error" | "no-access";
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

const defaultConfigs = {
  "no-data": {
    icon: FileText,
    title: "No hay datos disponibles",
    description: "Comienza agregando tu primer registro para ver información aquí.",
  },
  "no-results": {
    icon: Search,
    title: "Sin resultados",
    description: "No encontramos registros que coincidan con tu búsqueda. Intenta con otros filtros.",
  },
  "error": {
    icon: RefreshCw,
    title: "Error al cargar",
    description: "Ocurrió un problema al cargar los datos. Intenta refrescar la página.",
  },
  "no-access": {
    icon: Filter,
    title: "Acceso restringido",
    description: "No tienes permisos para ver este contenido.",
  },
};

export function EmptyState({
  type = "no-data",
  title,
  description,
  icon: CustomIcon,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  const router = useRouter();
  const config = defaultConfigs[type];
  const Icon = CustomIcon || config.icon;

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (actionHref) {
      router.push(actionHref);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center",
        "bg-muted/30",
        className
      )}
    >
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        {title || config.title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">
        {description || config.description}
      </p>
      {(actionLabel || onAction || actionHref) && (
        <Button onClick={handleAction} className="gap-2">
          <Plus className="h-4 w-4" />
          {actionLabel || "Agregar"}
        </Button>
      )}
    </div>
  );
}

// Configuraciones específicas por módulo
export function EmptyEnfundes({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={Sprout}
      title="No hay enfundes registrados"
      description="Registra los enfundes semanales de tus fincas para llevar un control de la producción."
      actionLabel="Registrar Enfunde"
      onAction={onAdd}
    />
  );
}

export function EmptyCosechas({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={Sprout}
      title="No hay cosechas registradas"
      description="Registra las cosechas semanales para monitorear la producción de cajas."
      actionLabel="Registrar Cosecha"
      onAction={onAdd}
    />
  );
}

export function EmptyEmpleados({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title="No hay empleados registrados"
      description="Agrega empleados para gestionar la nómina y asignarles tareas."
      actionLabel="Agregar Empleado"
      onAction={onAdd}
    />
  );
}

export function EmptyInsumos({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={Package}
      title="No hay insumos registrados"
      description="Registra los insumos de tu inventario para controlar el stock."
      actionLabel="Agregar Insumo"
      onAction={onAdd}
    />
  );
}

export function EmptyRolesPago({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title="No hay roles de pago"
      description="Genera roles de pago semanales para tus empleados."
      actionLabel="Generar Rol de Pago"
      onAction={onAdd}
    />
  );
}

export function EmptyPrestamos({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title="No hay préstamos registrados"
      description="Registra préstamos y adelantos para tus empleados."
      actionLabel="Registrar Préstamo"
      onAction={onAdd}
    />
  );
}

export function EmptyAlertas() {
  return (
    <EmptyState
      icon={BarChart3}
      title="¡Todo en orden!"
      description="No hay alertas activas. Tu inventario y producción están funcionando correctamente."
    />
  );
}

export function NoSearchResults({ query, onClear }: { query?: string; onClear?: () => void }) {
  return (
    <EmptyState
      type="no-results"
      title={query ? `Sin resultados para "${query}"` : "Sin resultados"}
      description="Intenta con otros términos de búsqueda o ajusta los filtros."
      actionLabel="Limpiar búsqueda"
      onAction={onClear}
    />
  );
}
