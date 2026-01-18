"use client";

import { MovimientoForm } from "@/src/components/inventario/movimiento-form";
import { MovimientosTable } from "@/src/components/inventario/movimientos-table";
import { useApp } from "@/src/contexts/app-context";
import { Badge } from "@/src/components/ui/badge";
import { MapPin } from "lucide-react";

export default function MovimientosPage() {
  const { fincas, currentUser } = useApp();
  
  const fincaAsignadaNombre = (() => {
    if (!currentUser?.fincaAsignada) return null;
    const f = fincas.find((fi) => fi.id === currentUser.fincaAsignada || fi.nombre === currentUser.fincaAsignada);
    return f?.nombre || currentUser.fincaAsignada;
  })();
  const esFiltrado = currentUser?.rol === 'supervisor_finca' || currentUser?.rol === 'bodeguero';

  return (
    <div className="responsive-container space-y-4 md:space-y-6">
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Movimientos de Inventario
          </h1>
          {esFiltrado && fincaAsignadaNombre && (
            <Badge variant="outline" className="gap-1">
              <MapPin className="h-3 w-3" />
              {fincaAsignadaNombre}
            </Badge>
          )}
        </div>
        <p className="text-sm md:text-base text-muted-foreground">
          Registro de entradas y salidas {esFiltrado && fincaAsignadaNombre ? `de ${fincaAsignadaNombre}` : "con trazabilidad completa"}
        </p>
      </div>

      <MovimientoForm />
      <MovimientosTable />
    </div>
  );
}
