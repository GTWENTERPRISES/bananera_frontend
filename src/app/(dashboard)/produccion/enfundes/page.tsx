"use client";

import { EnfundeForm } from "@/src/components/produccion/enfunde-form";
import { EnfundesTable } from "@/src/components/produccion/enfundes-table";
import { useApp } from "@/src/contexts/app-context";
import { Badge } from "@/src/components/ui/badge";
import { MapPin } from "lucide-react";

export default function EnfundesPage() {
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
            Gestión de Enfundes
          </h1>
          {esFiltrado && fincaAsignadaNombre && (
            <Badge variant="outline" className="gap-1">
              <MapPin className="h-3 w-3" />
              {fincaAsignadaNombre}
            </Badge>
          )}
        </div>
        <p className="text-sm md:text-base text-muted-foreground">
          Registro y seguimiento de enfundes {esFiltrado && fincaAsignadaNombre ? `de ${fincaAsignadaNombre}` : "por finca y semana"}
        </p>
      </div>

      <EnfundeForm />
      <EnfundesTable />
    </div>
  );
}
