import { EmpleadoForm } from "@/src/components/nomina/empleado-form";
import { EmpleadosTable } from "@/src/components/nomina/empleados-table";

export default function EmpleadosPage() {
  return (
    <div className="responsive-container space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Gestión de Empleados
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Registro y administración de personal de las 4 fincas
        </p>
      </div>

      <EmpleadoForm />
      <EmpleadosTable />
    </div>
  );
}
