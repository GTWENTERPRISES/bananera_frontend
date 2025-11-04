import { RolPagoForm } from "@/src/components/nomina/rol-pago-form";
import { RolesPagoTable } from "@/src/components/nomina/roles-pago-table";

export default function RolesPagoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Roles de Pago</h1>
        <p className="text-muted-foreground">
          Generación y gestión de nómina semanal con cálculos automáticos
        </p>
      </div>

      <RolPagoForm />
      <RolesPagoTable />
    </div>
  );
}
