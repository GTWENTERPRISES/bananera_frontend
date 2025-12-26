import { EnfundeForm } from "@/src/components/produccion/enfunde-form";
import { EnfundesTable } from "@/src/components/produccion/enfundes-table";

export default function EnfundesPage() {
  return (
    <div className="responsive-container space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Gestión de Enfundes
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Registro y seguimiento de enfundes por finca y semana
        </p>
      </div>

      <EnfundeForm />
      <EnfundesTable />
    </div>
  );
}
