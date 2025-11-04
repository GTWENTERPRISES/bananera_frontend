import { PrestamoForm } from "@/src/components/nomina/prestamo-form";
import { PrestamosTable } from "@/src/components/nomina/prestamos-table";

export default function PrestamosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Control de Préstamos
        </h1>
        <p className="text-muted-foreground">
          Gestión de préstamos a empleados con seguimiento de cuotas
        </p>
      </div>

      <PrestamoForm />
      <PrestamosTable />
    </div>
  );
}
