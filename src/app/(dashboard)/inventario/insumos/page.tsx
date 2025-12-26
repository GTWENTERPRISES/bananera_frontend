import { InsumoForm } from "@/src/components/inventario/insumo-form";
import { InsumosTable } from "@/src/components/inventario/insumos-table";

export default function InsumosPage() {
  return (
    <div className="responsive-container space-y-4 md:space-y-6 overflow-x-hidden px-4 md:px-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Gestión de Insumos
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Control de inventario con alertas automáticas de stock bajo
        </p>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <InsumoForm />
        </div>
      </div>

      <InsumosTable />
    </div>
  );
}
