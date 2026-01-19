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
import type { FincaName } from "@/src/lib/types";
import { Badge } from "@/src/components/ui/badge";
import { ExportButton } from "@/src/components/shared/export-button";
import { useMemo, useState } from "react";
import { Input } from "../ui/input";
import { Edit, Search, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/src/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/src/components/ui/alert-dialog";
import { Label } from "@/src/components/ui/label";
import { Switch } from "@/src/components/ui/switch";
import { toast } from "sonner";
import { EmpleadoSchema } from "@/src/lib/validation";

export function EmpleadosTable() {
  const { getFilteredEmpleados, fincas, updateEmpleado, deleteEmpleado, canAccess } = useApp();
  const empleados = getFilteredEmpleados();
  const [searchTerm, setSearchTerm] = useState("");
  const [fincaSel, setFincaSel] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState<string>("fechaIngreso");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const allowEdit = canAccess("nomina", "edit");
  const [editing, setEditing] = useState<any | null>(null);
  const [toDelete, setToDelete] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ nombre: "", cedula: "", labor: "", finca: "", lote: "", tarifaDiaria: 0, fechaIngreso: "", telefono: "", direccion: "", cuentaBancaria: "", activo: true });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const isValidFinca = (value: string): value is FincaName => ["BABY","SOLO","LAURITA","MARAVILLA"].includes(value);
  const handleFincaChange = (value: string) => setEditForm({ ...editForm, finca: isValidFinca(value) ? value : "" });

  const activos = empleados.filter((e) => e.activo).length;
  const inactivos = empleados.filter((e) => !e.activo).length;

  const filteredEmpleados = useMemo(() => {
    return empleados.filter((empleado) => {
      const matchesSearch =
        empleado.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (empleado.labor || empleado.cargo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        empleado.cedula.includes(searchTerm);
      const fincaName = empleado.fincaNombre || empleado.finca;
      const matchesFinca = fincaSel === "all" ? true : fincaName === fincaSel;
      const d = new Date(empleado.fechaIngreso);
      const matchesStart = startDate ? d >= new Date(startDate) : true;
      const matchesEnd = endDate ? d <= new Date(endDate) : true;
      return matchesSearch && matchesFinca && matchesStart && matchesEnd;
    });
  }, [empleados, searchTerm, fincaSel, startDate, endDate]);

  const sorted = useMemo(() => {
    const data = [...filteredEmpleados];
    data.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortBy) {
        case "nombre":
          return a.nombre.localeCompare(b.nombre) * dir;
        case "labor":
          return (a.labor || a.cargo || '').localeCompare(b.labor || b.cargo || '') * dir;
        case "finca":
          return ((a.fincaNombre || a.finca).localeCompare(b.fincaNombre || b.finca)) * dir as any;
        case "fechaIngreso":
        default: {
          const av = new Date(a.fechaIngreso).getTime();
          const bv = new Date(b.fechaIngreso).getTime();
          return (av - bv) * dir;
        }
      }
    });
    return data;
  }, [filteredEmpleados, sortBy, sortDir]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = (page - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const paginated = sorted.slice(startIdx, endIdx);

  return (
    <>
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
          <Select value={fincaSel} onValueChange={(v) => { setFincaSel(v); setPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Finca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {Array.from(new Set(fincas.map((f) => f.nombre))).map((n) => (
                <SelectItem key={n} value={n}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} className="w-[140px]" />
          <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} className="w-[140px]" />
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
            <span className="ml-4 text-sm text-muted-foreground">Orden</span>
            <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Fecha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fechaIngreso">Fecha</SelectItem>
                <SelectItem value="nombre">Nombre</SelectItem>
                <SelectItem value="labor">Labor</SelectItem>
                <SelectItem value="finca">Finca</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortDir} onValueChange={(v) => { setSortDir(v as any); setPage(1); }}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Desc" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Asc</SelectItem>
                <SelectItem value="desc">Desc</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {paginated.length === 0 ? (
          <div className="flex items-center justify-center rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No hay empleados que coincidan con tu búsqueda.
          </div>
        ) : (
          <div key={`${searchTerm}-${pageSize}-${page}`} className="overflow-x-auto overflow-y-auto max-h-[540px] animate-in fade-in duration-200 rounded-md border border-border responsive-table">
            <Table className="text-sm table-auto md:table-fixed min-w-[1000px]">
              <TableHeader className="sticky top-0 z-10 bg-background shadow-sm text-xs md:text-sm">
              <TableRow>
                <TableHead>Cédula</TableHead>
                <TableHead className="truncate max-w-[160px]">Nombre</TableHead>
                <TableHead className="truncate max-w-[140px]">Labor</TableHead>
                <TableHead>Fecha Ingreso</TableHead>
                <TableHead className="text-right">Tarifa Diaria</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[84px] min-w-[84px] text-right">Acciones</TableHead>
              </TableRow>
              </TableHeader>
              <TableBody className="animate-in fade-in duration-200">
                {paginated.map((empleado) => (
                <TableRow key={empleado.id} className="odd:bg-muted/50 hover:bg-muted transition-colors">
                  <TableCell className="font-medium">
                    {empleado.cedula}
                  </TableCell>
                  <TableCell className="truncate max-w-[160px]">{empleado.nombre}</TableCell>
                  <TableCell className="truncate max-w-[140px]">{empleado.labor}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {new Date(empleado.fechaIngreso).toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "numeric" })}
                  </TableCell>
                  <TableCell className="text-right tabular-nums whitespace-nowrap">${(empleado.tarifaDiaria || empleado.salarioBase || 0).toLocaleString("es-EC", { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>
                    <Badge
                      variant={empleado.activo ? "default" : "destructive"}
                    >
                      {empleado.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="w-[84px] min-w-[84px] text-right">
                    <div className="inline-flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" disabled={!allowEdit} onClick={() => { setEditing(empleado); setEditForm({ nombre: empleado.nombre, cedula: empleado.cedula, labor: empleado.labor || empleado.cargo || "", finca: empleado.finca, lote: empleado.lote || "", tarifaDiaria: empleado.tarifaDiaria || empleado.salarioBase || 0, fechaIngreso: empleado.fechaIngreso, telefono: empleado.telefono || "", direccion: empleado.direccion || "", cuentaBancaria: empleado.cuentaBancaria || "", activo: empleado.activo }); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" disabled={!allowEdit} onClick={() => setToDelete(empleado)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">Mostrando {total === 0 ? 0 : startIdx + 1}-{endIdx} de {total}</p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" size="default" disabled={page <= 1} onClick={(e) => { e.preventDefault(); if (page > 1) setPage((p) => Math.max(1, p - 1)); }} />
              </PaginationItem>
              {Array.from({ length: pageCount }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink href="#" isActive={page === i + 1} size="icon" onClick={(e) => { e.preventDefault(); setPage(i + 1); }}>
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext href="#" size="default" disabled={page >= pageCount} onClick={(e) => { e.preventDefault(); if (page < pageCount) setPage((p) => Math.min(pageCount, p + 1)); }} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>

    <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
      <DialogContent className="sm:max-w-[640px] w-[95vw] max-h-[85vh] overflow-y-auto px-3 sm:px-6">
        <DialogHeader>
          <DialogTitle>Editar Empleado</DialogTitle>
        </DialogHeader>
        {editing && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Nombre *</Label>
              <p className="text-xs text-muted-foreground">Nombres y apellidos</p>
              <Input className="h-11" value={editForm.nombre} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })} />
              {editErrors.nombre && (<p className="text-xs text-red-600">{editErrors.nombre}</p>)}
            </div>
            <div className="space-y-1">
              <Label>Cédula *</Label>
              <p className="text-xs text-muted-foreground">10 dígitos</p>
              <Input className="h-11" value={editForm.cedula} onChange={(e) => setEditForm({ ...editForm, cedula: e.target.value })} />
              {editErrors.cedula && (<p className="text-xs text-red-600">{editErrors.cedula}</p>)}
            </div>
            <div className="space-y-1">
              <Label>Labor *</Label>
              <p className="text-xs text-muted-foreground">Actividad principal</p>
              <Select value={editForm.labor} onValueChange={(v) => setEditForm({ ...editForm, labor: v })}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Seleccionar labor" />
                </SelectTrigger>
                <SelectContent className="w-[var(--radix-select-trigger-width)] max-w-[95vw]">
                  <SelectItem value="Enfunde">Enfunde</SelectItem>
                  <SelectItem value="Cosecha">Cosecha</SelectItem>
                  <SelectItem value="Calibración">Calibración</SelectItem>
                  <SelectItem value="Varios">Varios</SelectItem>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Supervisor">Supervisor</SelectItem>
                </SelectContent>
              </Select>
              {editErrors.labor && (<p className="text-xs text-red-600">{editErrors.labor}</p>)}
            </div>
            <div className="space-y-1">
              <Label>Finca *</Label>
              <p className="text-xs text-muted-foreground">Lugar de trabajo</p>
              <Select value={editForm.finca} onValueChange={handleFincaChange}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Seleccionar finca" />
                </SelectTrigger>
                <SelectContent className="w-[var(--radix-select-trigger-width)] max-w-[95vw]">
                  <SelectItem value="BABY">BABY</SelectItem>
                  <SelectItem value="SOLO">SOLO</SelectItem>
                  <SelectItem value="LAURITA">LAURITA</SelectItem>
                  <SelectItem value="MARAVILLA">MARAVILLA</SelectItem>
                </SelectContent>
              </Select>
              {editErrors.finca && (<p className="text-xs text-red-600">{editErrors.finca}</p>)}
            </div>
            <div className="space-y-1">
              <Label>Lote</Label>
              <p className="text-xs text-muted-foreground">Sector en finca</p>
              <Select value={editForm.lote} onValueChange={(v) => setEditForm({ ...editForm, lote: v })} disabled={!editForm.finca}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Seleccionar lote" />
                </SelectTrigger>
                <SelectContent className="w-[var(--radix-select-trigger-width)] max-w-[95vw]">
                  {(() => {
                    const f = fincas.find((x) => x.nombre === editForm.finca);
                    const keys = f?.lotes ? Object.keys(f.lotes) : ["A","B","C","D","E"];
                    return keys.map((k) => (
                      <SelectItem key={k} value={k}>{k}</SelectItem>
                    ));
                  })()}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Tarifa Diaria ($) *</Label>
              <p className="text-xs text-muted-foreground">Salario por día</p>
              <Input className="h-11" type="number" step="0.01" min="0" value={String(editForm.tarifaDiaria)} onChange={(e) => setEditForm({ ...editForm, tarifaDiaria: Number.parseFloat(e.target.value || "0") })} />
              {editErrors.tarifaDiaria && (<p className="text-xs text-red-600">{editErrors.tarifaDiaria}</p>)}
            </div>
            <div className="space-y-1">
              <Label>Fecha Ingreso *</Label>
              <p className="text-xs text-muted-foreground">Inicio de labores</p>
              <Input className="h-11" type="date" value={editForm.fechaIngreso} onChange={(e) => setEditForm({ ...editForm, fechaIngreso: e.target.value })} />
              {editErrors.fechaIngreso && (<p className="text-xs text-red-600">{editErrors.fechaIngreso}</p>)}
            </div>
            <div className="space-y-1">
              <Label>Estado</Label>
              <p className="text-xs text-muted-foreground">¿Actualmente labora?</p>
              <div className="flex items-center gap-2 mt-2">
                <Switch checked={editForm.activo} onCheckedChange={(v) => setEditForm({ ...editForm, activo: !!v })} />
                <span className="text-sm">{editForm.activo ? "Activo" : "Inactivo"}</span>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Teléfono</Label>
              <p className="text-xs text-muted-foreground">Número de contacto</p>
              <Input className="h-11" value={editForm.telefono} onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })} />
              {editErrors.telefono && (<p className="text-xs text-red-600">{editErrors.telefono}</p>)}
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Dirección</Label>
              <p className="text-xs text-muted-foreground">Domicilio del empleado</p>
              <Input className="h-11" value={editForm.direccion} onChange={(e) => setEditForm({ ...editForm, direccion: e.target.value })} />
              {editErrors.direccion && (<p className="text-xs text-red-600">{editErrors.direccion}</p>)}
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Cuenta Bancaria</Label>
              <p className="text-xs text-muted-foreground">Para depósito de salario</p>
              <Input className="h-11" value={editForm.cuentaBancaria} onChange={(e) => setEditForm({ ...editForm, cuentaBancaria: e.target.value })} />
              {editErrors.cuentaBancaria && (<p className="text-xs text-red-600">{editErrors.cuentaBancaria}</p>)}
            </div>
            <div className="md:col-span-2">
              <Button className="w-full h-11 text-base" onClick={() => { const fincaMaybe = isValidFinca(String(editForm.finca)) ? String(editForm.finca) : String(editing.finca); const parsed = EmpleadoSchema.safeParse({ nombre: editForm.nombre, cedula: editForm.cedula, labor: editForm.labor, finca: fincaMaybe, tarifaDiaria: String(editForm.tarifaDiaria), fechaIngreso: editForm.fechaIngreso || editing.fechaIngreso, telefono: editForm.telefono || undefined, activo: editForm.activo, lote: editForm.lote || undefined, direccion: editForm.direccion, cuentaBancaria: editForm.cuentaBancaria }); if (!parsed.success) { const flat = parsed.error.flatten(); const fieldErrors: Record<string, string> = {}; Object.entries(flat.fieldErrors).forEach(([k, v]) => { if (v && v.length) fieldErrors[k] = String(v[0]); }); setEditErrors(fieldErrors); toast.error(Object.values(fieldErrors)[0] || "Revisa los campos"); return; } const finca = fincaMaybe as FincaName; updateEmpleado(editing.id, { nombre: editForm.nombre, cedula: editForm.cedula, labor: editForm.labor, finca, lote: editForm.lote || undefined, tarifaDiaria: editForm.tarifaDiaria, fechaIngreso: editForm.fechaIngreso || editing.fechaIngreso, telefono: editForm.telefono || undefined, direccion: editForm.direccion || undefined, cuentaBancaria: editForm.cuentaBancaria || undefined, activo: editForm.activo }); setEditErrors({}); toast.success("Empleado actualizado"); setEditing(null); }}>Guardar cambios</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

    <AlertDialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar empleado</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={() => { if (toDelete) { deleteEmpleado(toDelete.id); toast.success("Empleado eliminado"); setToDelete(null); } }}>Eliminar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
