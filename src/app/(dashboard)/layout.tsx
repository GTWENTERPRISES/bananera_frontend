"use client"

import type React from "react"
import { AppSidebar } from "@/src/components/layout/app-sidebar";
import { AppHeader } from "@/src/components/layout/app-header";
import { Breadcrumbs } from "@/src/components/layout/breadcrumbs";
import { ProtectedRoute } from "@/src/components/auth/protected-route";
import { OnboardingTour } from "@/src/components/shared/onboarding-tour";
import { usePathname } from "next/navigation";
import { useApp } from "@/src/contexts/app-context";
import { Suspense, useEffect, useState } from "react";
import { Spinner } from "@/src/components/ui/spinner";
import { useKeyboardShortcuts } from "@/src/hooks/use-keyboard-shortcuts";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const { canAccess } = useApp();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Atajos de teclado globales
  useKeyboardShortcuts();

  useEffect(() => {
    setIsTransitioning(true);
    const t = setTimeout(() => setIsTransitioning(false), 600);
    return () => clearTimeout(t);
  }, [pathname]);

  const mapResource = (href: string):
    | "dashboard"
    | "produccion"
    | "nomina"
    | "inventario"
    | "reportes"
    | "analytics"
    | "geovisualizacion"
    | "configuracion" => {
    if (href.startsWith("/dashboard")) return "dashboard";
    if (href.startsWith("/produccion")) return "produccion";
    if (href.startsWith("/nomina")) return "nomina";
    if (href.startsWith("/inventario")) return "inventario";
    if (href.startsWith("/reportes")) return "reportes";
    if (href.startsWith("/analytics")) return "analytics";
    if (href.startsWith("/geovisualizacion")) return "geovisualizacion";
    if (href.startsWith("/configuracion")) return "configuracion";
    return "dashboard";
  };

  const resource = mapResource(pathname || "/dashboard");
  const allowView = canAccess(resource, "view");

  return (
    <ProtectedRoute>
      <OnboardingTour />
      <div className="flex h-screen overflow-hidden">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AppHeader />
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-4 md:p-6">
              <Breadcrumbs />
              {allowView ? (
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center h-[60vh]">
                      <Spinner className="h-6 w-6" />
                    </div>
                  }
                >
                  <div className="relative">
                    {isTransitioning && (
                      <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-background/60">
                        <Spinner className="h-8 w-8" />
                      </div>
                    )}
                    {children}
                  </div>
                </Suspense>
              ) : (
                <div className="rounded-lg border p-6">
                  <h2 className="text-xl font-semibold">Acceso restringido</h2>
                  <p className="text-muted-foreground">No tienes permisos para ver este módulo.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
