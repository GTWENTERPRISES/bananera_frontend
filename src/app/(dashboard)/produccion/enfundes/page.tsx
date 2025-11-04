import { EnfundeForm } from "@/src/components/produccion/enfunde-form";
import { EnfundesTable } from "@/src/components/produccion/enfundes-table";

export default function EnfundesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Gestión de Enfundes
        </h1>
        <p className="text-muted-foreground">
          Registro y seguimiento de enfundes por finca y semana
        </p>
      </div>

      <EnfundeForm />
      <EnfundesTable />
    </div>
  );
}
