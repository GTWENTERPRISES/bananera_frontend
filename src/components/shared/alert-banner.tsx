"use client";

import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";
import { AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

interface AlertBannerProps {
  tipo: "critico" | "advertencia" | "info";
  titulo: string;
  descripcion: string;
  onDismiss?: () => void;
  className?: string;
}

export function AlertBanner({
  tipo,
  titulo,
  descripcion,
  onDismiss,
  className,
}: AlertBannerProps) {
  const icons = {
    critico: AlertCircle,
    advertencia: AlertTriangle,
    info: Info,
  };

  const Icon = icons[tipo];

  return (
    <Alert
      className={cn(
        "",
        tipo === "critico" &&
          "border-destructive bg-destructive/10 text-destructive",
        tipo === "advertencia" &&
          "border-accent bg-accent/10 text-accent-foreground",
        tipo === "info" && "border-primary bg-primary/10 text-primary",
        className
      )}
    >
      <Icon className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        {titulo}
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </AlertTitle>
      <AlertDescription>{descripcion}</AlertDescription>
    </Alert>
  );
}
