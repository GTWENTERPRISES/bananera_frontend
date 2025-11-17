"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { useApp } from "@/src/contexts/app-context";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { ExportButton } from "@/src/components/shared/export-button";
import { DollarSign } from "lucide-react";
import { Progress } from "@/src/components/ui/progress";
import { cn } from "@/src/lib/utils";

export function PrestamosTable() {
  const { prestamos, updatePrestamo } = useApp();

  const totalPrestado = prestamos.reduce((sum, p) => sum + p.monto, 0);
  const totalPendiente = prestamos.reduce(
    (sum, p) => sum + p.saldoPendiente,
    0
  );
  const activos = prestamos.filter((p) => p.estado === "activo").length;

  // Función para pagar cuota
  const pagarCuotaPrestamo = (prestamoId: string) => {
    const prestamo = prestamos.find((p) => p.id === prestamoId);
    if (prestamo && prestamo.estado === "activo") {
      const nuevasCuotasPagadas = prestamo.cuotasPagadas + 1;
      const nuevoSaldo = prestamo.saldoPendiente - prestamo.valorCuota;

      // Verificar si el préstamo está completamente pagado
      const estaCompletamentePagado =
        nuevasCuotasPagadas >= prestamo.numeroCuotas;
      const nuevoEstado = estaCompletamentePagado ? "finalizado" : "activo"; // Cambiado de "cancelado" a "finalizado"

      // Actualizar solo las propiedades que cambian (Partial<Prestamo>)
      updatePrestamo(prestamoId, {
        cuotasPagadas: nuevasCuotasPagadas,
        saldoPendiente: Math.max(0, nuevoSaldo), // Asegurar que no sea negativo
        estado: nuevoEstado,
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gestión de Préstamos</CardTitle>
        <ExportButton
          data={prestamos.map((p) => ({
            empleado: p.empleado?.nombre || "N/A",
            monto: p.monto,
            valorCuota: p.valorCuota,
            cuotasPagadas: p.cuotasPagadas,
            numeroCuotas: p.numeroCuotas,
            saldoPendiente: p.saldoPendiente,
            fechaDesembolso: new Date(p.fechaDesembolso).toLocaleDateString("es-ES"),
            estado: p.estado === "activo" ? "Activo" : "Finalizado",
          }))}
          headers={[
            "Empleado",
            "Monto",
            "Cuota",
            "Cuotas Pagadas",
            "Nº Cuotas",
            "Saldo",
            "Fecha",
            "Estado",
          ]}
          keys={[
            "empleado",
            "monto",
            "valorCuota",
            "cuotasPagadas",
            "numeroCuotas",
            "saldoPendiente",
            "fechaDesembolso",
            "estado",
          ]}
          title="Gestión de Préstamos"
          filename="prestamos"
        />
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Total Prestado</p>
            <p className="text-2xl font-bold text-foreground">
              ${totalPrestado.toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Saldo Pendiente</p>
            <p className="text-2xl font-bold text-red-600">
              ${totalPendiente.toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Préstamos Activos</p>
            <p className="text-2xl font-bold text-foreground">{activos}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="text-right">Cuota</TableHead>
                <TableHead>Progreso</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prestamos.map((prestamo) => {
                const progreso =
                  (prestamo.cuotasPagadas / prestamo.numeroCuotas) * 100;
                return (
                  <TableRow key={prestamo.id}>
                    <TableCell className="font-medium">
                      {prestamo.empleado?.nombre || "Empleado no encontrado"}
                    </TableCell>
                    <TableCell className="text-right">
                      ${prestamo.monto.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${prestamo.valorCuota.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Progress value={progreso} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {prestamo.cuotasPagadas}/{prestamo.numeroCuotas}{" "}
                          cuotas
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${prestamo.saldoPendiente.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {new Date(prestamo.fechaDesembolso).toLocaleDateString(
                        "es-ES"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="default"
                        className={cn(
                          prestamo.estado === "activo"
                            ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200"
                        )}
                      >
                        {prestamo.estado === "activo" ? "Activo" : "Finalizado"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {prestamo.estado === "activo" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 bg-transparent"
                          onClick={() => pagarCuotaPrestamo(prestamo.id)}
                        >
                          <DollarSign className="h-3 w-3" />
                          Pagar Cuota
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
