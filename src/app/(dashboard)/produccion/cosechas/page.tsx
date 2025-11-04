import { CosechaForm } from "@/src/components/produccion/cosecha-form";
import { CosechasTable } from "@/src/components/produccion/cosechas-table";

export default function CosechasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Control de Cosechas
        </h1>
        <p className="text-muted-foreground">
          Registro de cosechas con cálculo automático de ratios y mermas
        </p>
      </div>

      <CosechaForm />
      <CosechasTable />
    </div>
  );
}
