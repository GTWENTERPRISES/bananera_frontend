import { RolPagoForm } from "@/src/components/nomina/rol-pago-form";
import { RolesPagoTable } from "@/src/components/nomina/roles-pago-table";

export default function RolesPagoPage() {
  return (
    <div className="responsive-container space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Roles de Pago</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Generación y gestión de nómina semanal con cálculos automáticos
        </p>
      </div>

      <RolPagoForm />
      <RolesPagoTable />
    </div>
  );
}
