import { MovimientoForm } from "@/src/components/inventario/movimiento-form";
import { MovimientosTable } from "@/src/components/inventario/movimientos-table";

export default function MovimientosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Movimientos de Inventario
        </h1>
        <p className="text-muted-foreground">
          Registro de entradas y salidas con trazabilidad completa
        </p>
      </div>

      <MovimientoForm />
      <MovimientosTable />
    </div>
  );
}
