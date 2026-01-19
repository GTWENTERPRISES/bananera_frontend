"use client";

import { useState } from "react";
import { EmpleadoForm } from "@/src/components/nomina/empleado-form";
import { EmpleadosTable } from "@/src/components/nomina/empleados-table";
import { Button } from "@/src/components/ui/button";
import { Plus, X } from "lucide-react";

export default function EmpleadosPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="responsive-container space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Gestión de Empleados
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Registro y administración de personal de las fincas
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
          {showForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          {showForm ? "Cancelar" : "Nuevo Empleado"}
        </Button>
      </div>

      {showForm && <EmpleadoForm />}
      <EmpleadosTable />
    </div>
  );
}
