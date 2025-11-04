import { InsumoForm } from "@/src/components/inventario/insumo-form";
import { InsumosTable } from "@/src/components/inventario/insumos-table";
import { AlertasInventario } from "@/src/components/inventario/alertas-inventario";

export default function InsumosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Gestión de Insumos
        </h1>
        <p className="text-muted-foreground">
          Control de inventario con alertas automáticas de stock bajo
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <InsumoForm />
        </div>
        <AlertasInventario />
      </div>

      <InsumosTable />
    </div>
  );
}
