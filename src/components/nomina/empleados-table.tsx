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
import { ExportButton } from "@/src/components/shared/export-button";
import { useState } from "react";
import { Input } from "../ui/input";
import { Edit, Search, Trash2 } from "lucide-react";
import { Button } from "../ui/button";

export function EmpleadosTable() {
  const { empleados } = useApp();
  const [searchTerm, setSearchTerm] = useState("");

  const activos = empleados.filter((e) => e.activo).length;
  const inactivos = empleados.filter((e) => !e.activo).length;
  
  const filteredEmpleados = empleados.filter(
    (empleado) =>
      empleado.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empleado.labor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empleado.cedula.includes(searchTerm)
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Lista de Empleados</CardTitle>
        <ExportButton
          data={filteredEmpleados}
          headers={[
            "Cédula",
            "Nombre",
            "Labor",
            "Fecha Ingreso",
            "Tarifa Diaria",
            "Estado",
          ]}
          filename="empleados.xlsx"
        />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Empleados</p>
            <p className="text-2xl font-bold text-foreground">
              {empleados.length}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Activos</p>
            <p className="text-2xl font-bold text-success">{activos}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Inactivos</p>
            <p className="text-2xl font-bold text-destructive">{inactivos}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, labor o cédula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cédula</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Labor</TableHead>
                <TableHead>Fecha Ingreso</TableHead>
                <TableHead>Tarifa Diaria</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmpleados.map((empleado) => (
                <TableRow key={empleado.id}>
                  <TableCell className="font-medium">
                    {empleado.cedula}
                  </TableCell>
                  <TableCell>{empleado.nombre}</TableCell>
                  <TableCell>{empleado.labor}</TableCell>
                  <TableCell>
                    {new Date(empleado.fechaIngreso).toLocaleDateString()}
                  </TableCell>
                  <TableCell>${empleado.tarifaDiaria.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={empleado.activo ? "default" : "destructive"}
                    >
                      {empleado.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
