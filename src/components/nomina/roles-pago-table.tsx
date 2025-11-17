"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { useApp } from "@/src/contexts/app-context";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { ExportButton } from "@/src/components/shared/export-button";
import { CheckCircle2, Clock } from "lucide-react";

export function RolesPagoTable() {
  const { rolesPago, updateRolPagoEstado } = useApp();

  const totalNomina =
    rolesPago?.reduce((sum, r) => sum + (r.netoAPagar || 0), 0) || 0;
  const pendientes =
    rolesPago?.filter((r) => r.estado === "pendiente").length || 0;
  const pagados = rolesPago?.filter((r) => r.estado === "pagado").length || 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Roles de Pago</CardTitle>
        <ExportButton
          data={rolesPago?.map((rol) => ({
            empleado: rol.empleado?.nombre || "N/A",
            semana: rol.semana,
            diasLaborados: rol.diasLaborados || 0,
            horasExtras: rol.horasExtras || 0,
            totalIngresos: rol.totalIngresos || 0,
            totalEgresos: rol.totalEgresos || 0,
            netoAPagar: rol.netoAPagar || 0,
            estado: rol.estado === "pagado" ? "Pagado" : "Pendiente",
          })) || []}
          headers={[
            "Empleado",
            "Semana",
            "Días",
            "H. Extras",
            "Ingresos",
            "Descuentos",
            "Neto",
            "Estado",
          ]}
          keys={[
            "empleado",
            "semana",
            "diasLaborados",
            "horasExtras",
            "totalIngresos",
            "totalEgresos",
            "netoAPagar",
            "estado",
          ]}
          title="Roles de Pago"
          filename="roles-pago"
        />
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Total Nómina</p>
            <p className="text-2xl font-bold text-foreground">
              ${totalNomina.toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-600">{pendientes}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Pagados</p>
            <p className="text-2xl font-bold text-green-600">{pagados}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Semana</TableHead>
                <TableHead className="text-right">Días</TableHead>
                <TableHead className="text-right">H. Extras</TableHead>
                <TableHead className="text-right">Ingresos</TableHead>
                <TableHead className="text-right">Descuentos</TableHead>
                <TableHead className="text-right">Neto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rolesPago?.map((rol) => (
                <TableRow key={rol.id}>
                  <TableCell className="font-medium">
                    {rol.empleado?.nombre || "N/A"}
                  </TableCell>
                  <TableCell>S{rol.semana}</TableCell>
                  <TableCell className="text-right">
                    {rol.diasLaborados || 0}
                  </TableCell>
                  <TableCell className="text-right">
                    {rol.horasExtras || 0}
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    ${(rol.totalIngresos || 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    ${(rol.totalEgresos || 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    ${(rol.netoAPagar || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        rol.estado === "pagado" ? "default" : "secondary"
                      }
                    >
                      {rol.estado === "pagado" ? "Pagado" : "Pendiente"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {rol.estado === "pendiente" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 bg-transparent"
                        onClick={() => updateRolPagoEstado(rol.id, "pagado")}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Marcar Pagado
                      </Button>
                    )}
                    {rol.estado === "pagado" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1"
                        onClick={() => updateRolPagoEstado(rol.id, "pendiente")}
                      >
                        <Clock className="h-3 w-3" />
                        Revertir
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
