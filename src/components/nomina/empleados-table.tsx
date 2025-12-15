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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/src/components/ui/pagination";

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

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const total = filteredEmpleados.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = (page - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const paginated = filteredEmpleados.slice(startIdx, endIdx);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Lista de Empleados</CardTitle>
        <ExportButton
          data={filteredEmpleados.map(e => ({
            ...e,
            estado: e.activo ? "Activo" : "Inactivo",
          }))}
          headers={[
            "Cédula",
            "Nombre",
            "Labor",
            "Fecha Ingreso",
            "Tarifa Diaria",
            "Estado",
          ]}
          keys={[
            "cedula",
            "nombre",
            "labor",
            "fechaIngreso",
            "tarifaDiaria",
            "estado",
          ]}
          title="Lista de Empleados"
          filename="empleados"
          enableFilter
          dateField="fechaIngreso"
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
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ver</span>
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
              <SelectTrigger className="w-[90px]">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">por página</span>
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
              {paginated.map((empleado) => (
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
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">Mostrando {total === 0 ? 0 : startIdx + 1}-{endIdx} de {total}</p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" size="default" onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }} />
              </PaginationItem>
              {Array.from({ length: pageCount }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink href="#" isActive={page === i + 1} size="icon" onClick={(e) => { e.preventDefault(); setPage(i + 1); }}>
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext href="#" size="default" onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(pageCount, p + 1)); }} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
}
