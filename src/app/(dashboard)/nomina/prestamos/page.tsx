import { PrestamoForm } from "@/src/components/nomina/prestamo-form";
import { PrestamosTable } from "@/src/components/nomina/prestamos-table";

export default function PrestamosPage() {
  return (
    <div className="responsive-container space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Control de Préstamos
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Gestión de préstamos a empleados con seguimiento de cuotas
        </p>
      </div>

      <PrestamoForm />
      <PrestamosTable />
    </div>
  );
}
