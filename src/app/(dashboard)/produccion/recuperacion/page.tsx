"use client";

import { useState } from "react";
import { RecuperacionForm } from "@/src/components/produccion/recuperacion-form";
import { RecuperacionTable } from "@/src/components/produccion/recuperacion-table";
import { useApp } from "@/src/contexts/app-context";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { MapPin, Plus, X } from "lucide-react";

export default function RecuperacionPage() {
  const { fincas, currentUser } = useApp();
  const [showForm, setShowForm] = useState(false);
  
  const fincaAsignadaNombre = (() => {
    if (!currentUser?.fincaAsignada) return null;
    const f = fincas.find((fi) => fi.id === currentUser.fincaAsignada || fi.nombre === currentUser.fincaAsignada);
    return f?.nombre || currentUser.fincaAsignada;
  })();
  const esFiltrado = currentUser?.rol === 'supervisor_finca' || currentUser?.rol === 'bodeguero';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-foreground">
              Recuperación de Cintas
            </h1>
            {esFiltrado && fincaAsignadaNombre && (
              <Badge variant="outline" className="gap-1">
                <MapPin className="h-3 w-3" />
                {fincaAsignadaNombre}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Seguimiento de recuperación {esFiltrado && fincaAsignadaNombre ? `de ${fincaAsignadaNombre}` : "por calibraciones"}
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
          {showForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          {showForm ? "Cancelar" : "Nueva Recuperación"}
        </Button>
      </div>

      {showForm && <RecuperacionForm />}
      <RecuperacionTable />
    </div>
  );
}
