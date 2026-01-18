"use client";

import { InsumoForm } from "@/src/components/inventario/insumo-form";
import { InsumosTable } from "@/src/components/inventario/insumos-table";
import { useApp } from "@/src/contexts/app-context";
import { Badge } from "@/src/components/ui/badge";
import { MapPin } from "lucide-react";

export default function InsumosPage() {
  const { fincas, currentUser } = useApp();
  
  const fincaAsignadaNombre = (() => {
    if (!currentUser?.fincaAsignada) return null;
    const f = fincas.find((fi) => fi.id === currentUser.fincaAsignada || fi.nombre === currentUser.fincaAsignada);
    return f?.nombre || currentUser.fincaAsignada;
  })();
  const esFiltrado = currentUser?.rol === 'supervisor_finca' || currentUser?.rol === 'bodeguero';

  return (
    <div className="responsive-container space-y-4 md:space-y-6 overflow-x-hidden px-4 md:px-6">
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Gestión de Insumos
          </h1>
          {esFiltrado && fincaAsignadaNombre && (
            <Badge variant="outline" className="gap-1">
              <MapPin className="h-3 w-3" />
              {fincaAsignadaNombre}
            </Badge>
          )}
        </div>
        <p className="text-sm md:text-base text-muted-foreground">
          Control de inventario {esFiltrado && fincaAsignadaNombre ? `de ${fincaAsignadaNombre}` : "con alertas automáticas de stock bajo"}
        </p>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <InsumoForm />
        </div>
      </div>

      <InsumosTable />
    </div>
  );
}
