"use client";

import { useState } from "react";
import { PrestamoForm } from "@/src/components/nomina/prestamo-form";
import { PrestamosTable } from "@/src/components/nomina/prestamos-table";
import { Button } from "@/src/components/ui/button";
import { Plus, X } from "lucide-react";

export default function PrestamosPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="responsive-container space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Control de Préstamos
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gestión de préstamos a empleados con seguimiento de cuotas
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
          {showForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          {showForm ? "Cancelar" : "Nuevo Préstamo"}
        </Button>
      </div>

      {showForm && <PrestamoForm />}
      <PrestamosTable />
    </div>
  );
}
