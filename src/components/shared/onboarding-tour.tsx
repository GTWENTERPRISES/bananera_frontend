"use client";

import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { X, ChevronRight, ChevronLeft, Sparkles, LayoutDashboard, Package, Users, BarChart3, Settings, Search } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: string;
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "¡Bienvenido a Bananera HG!",
    description: "Este tour te ayudará a conocer las funciones principales del sistema. Puedes saltarlo en cualquier momento.",
    icon: <Sparkles className="h-8 w-8 text-primary" />,
  },
  {
    id: "dashboard",
    title: "Dashboard Principal",
    description: "Aquí verás un resumen de KPIs, alertas activas y accesos rápidos a las funciones más usadas.",
    icon: <LayoutDashboard className="h-8 w-8 text-blue-500" />,
  },
  {
    id: "produccion",
    title: "Gestión de Producción",
    description: "Registra enfundes, cosechas y recuperación de cintas. Controla la producción semanal de cada finca.",
    icon: <Package className="h-8 w-8 text-green-500" />,
  },
  {
    id: "nomina",
    title: "Nómina y Personal",
    description: "Administra empleados, genera roles de pago semanales y gestiona préstamos y adelantos.",
    icon: <Users className="h-8 w-8 text-orange-500" />,
  },
  {
    id: "inventario",
    title: "Control de Inventario",
    description: "Registra insumos, movimientos de stock y recibe alertas automáticas de stock bajo.",
    icon: <Package className="h-8 w-8 text-purple-500" />,
  },
  {
    id: "reportes",
    title: "Reportes y Análisis",
    description: "Genera reportes de producción, financieros y exporta datos a Excel o PDF.",
    icon: <BarChart3 className="h-8 w-8 text-cyan-500" />,
  },
  {
    id: "busqueda",
    title: "Búsqueda Rápida",
    description: "Usa Ctrl+K (o ⌘K en Mac) para abrir la búsqueda rápida y navegar entre módulos.",
    icon: <Search className="h-8 w-8 text-yellow-500" />,
  },
  {
    id: "configuracion",
    title: "Configuración",
    description: "Gestiona usuarios, permisos y fincas desde el menú de configuración.",
    icon: <Settings className="h-8 w-8 text-gray-500" />,
  },
];

const TOUR_STORAGE_KEY = "bananera_tour_completed";

export function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!completed) {
      // Mostrar tour después de un pequeño delay
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
    setIsOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const step = tourSteps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 shadow-2xl">
        <CardHeader className="relative pb-2">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={handleSkip}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-muted">
              {step.icon}
            </div>
            <div>
              <Badge variant="secondary" className="mb-1">
                Paso {currentStep + 1} de {tourSteps.length}
              </Badge>
              <CardTitle className="text-xl">{step.title}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{step.description}</p>
          
          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mt-6">
            {tourSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentStep 
                    ? "bg-primary w-6" 
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSkip}>
              Saltar tour
            </Button>
            <Button onClick={handleNext}>
              {currentStep === tourSteps.length - 1 ? (
                "Comenzar"
              ) : (
                <>
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

// Botón para reiniciar el tour
export function RestartTourButton() {
  const handleRestart = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    window.location.reload();
  };

  return (
    <Button variant="outline" size="sm" onClick={handleRestart} className="gap-2">
      <Sparkles className="h-4 w-4" />
      Ver tour de bienvenida
    </Button>
  );
}
