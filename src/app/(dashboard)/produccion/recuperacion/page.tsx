import { RecuperacionForm } from "@/src/components/produccion/recuperacion-form";
import { RecuperacionTable } from "@/src/components/produccion/recuperacion-table";

export default function RecuperacionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Recuperación de Cintas
        </h1>
        <p className="text-muted-foreground">
          Seguimiento de recuperación por calibraciones con alertas automáticas
        </p>
      </div>

      <RecuperacionForm />
      <RecuperacionTable />
    </div>
  );
}
