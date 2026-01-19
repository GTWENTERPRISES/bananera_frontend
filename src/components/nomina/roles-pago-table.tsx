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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { exportRolPagoPDFCatorcenal } from "@/src/lib/export-utils";
import { CheckCircle2, Clock, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/src/components/ui/pagination";

export function RolesPagoTable() {
  const { rolesPago, updateRolPagoEstado, currentUser } = useApp();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfMode, setPdfMode] = useState<"semanas" | "quincena">("quincena");
  const [pdfFinca, setPdfFinca] = useState<string>("BABY");
  const [pdfSemanaInicio, setPdfSemanaInicio] = useState<string>("");
  const [pdfSemanaFin, setPdfSemanaFin] = useState<string>("");
  const [pdfAño, setPdfAño] = useState<string>("2025");
  const [pdfMes, setPdfMes] = useState<string>("1");
  const [pdfQuincena, setPdfQuincena] = useState<string>("1");
  const [pdfElaborado, setPdfElaborado] = useState<string>(currentUser?.nombre || "");
  const [pdfRevisado, setPdfRevisado] = useState<string>(currentUser?.nombre || "");
  const total = rolesPago?.length || 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = (page - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const sorted = (() => {
    const data = [...(rolesPago || [])];
    return data.sort((a, b) => {
      const ta = a.fecha || a.fechaPago ? new Date(a.fecha || a.fechaPago || '').getTime() : new Date(a.año || 2025, 0, 1 + ((a.semana || 1) - 1) * 7).getTime();
      const tb = b.fecha || b.fechaPago ? new Date(b.fecha || b.fechaPago || '').getTime() : new Date(b.año || 2025, 0, 1 + ((b.semana || 1) - 1) * 7).getTime();
      const cmp = (isNaN(ta) ? 0 : ta) - (isNaN(tb) ? 0 : tb);
      return sortDir === "asc" ? cmp : -cmp;
    });
  })();
  const paginated = sorted.slice(startIdx, endIdx);

  const totalNomina =
    rolesPago?.reduce((sum, r) => sum + (r.netoAPagar || 0), 0) || 0;
  const pendientes =
    rolesPago?.filter((r) => r.estado === "pendiente").length || 0;
  const pagados = rolesPago?.filter((r) => r.estado === "pagado").length || 0;

  const getDateFromYearSemana = (year: number, week: number) => {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dayOfWeek = simple.getDay();
    const ISOweekStart = new Date(simple);
    if (dayOfWeek <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Roles de Pago</CardTitle>
        <ExportButton
          data={rolesPago?.map((rol) => ({
            empleado: (rol as any).empleadoNombre || rol.empleado?.nombre || "N/A",
            semana: rol.semana,
            año: rol.año,
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
            "Año",
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
            "año",
            "diasLaborados",
            "horasExtras",
            "totalIngresos",
            "totalEgresos",
            "netoAPagar",
            "estado",
          ]}
          title="Roles de Pago"
          filename="roles-pago"
          enableFilter
          weekField="semana"
          yearField="año"
        />
        <Dialog open={pdfOpen} onOpenChange={setPdfOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2 ml-2">
              PDF catorcenal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Exportar rol de pago catorcenal</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Modo</Label>
                <Select value={pdfMode} onValueChange={(v) => setPdfMode(v as any)}>
                  <SelectTrigger><SelectValue placeholder="Modo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quincena">Quincena por mes</SelectItem>
                    <SelectItem value="semanas">Rango de semanas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Finca</Label>
                <Select value={pdfFinca} onValueChange={setPdfFinca}>
                  <SelectTrigger><SelectValue placeholder="Finca" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BABY">BABY</SelectItem>
                    <SelectItem value="SOLO">SOLO</SelectItem>
                    <SelectItem value="LAURITA">LAURITA</SelectItem>
                    <SelectItem value="MARAVILLA">MARAVILLA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {pdfMode === "semanas" && (
                <>
                  <div className="space-y-2">
                    <Label>Semana inicio</Label>
                    <Input value={pdfSemanaInicio} onChange={(e) => setPdfSemanaInicio(e.target.value)} placeholder="32" />
                  </div>
                  <div className="space-y-2">
                    <Label>Semana fin</Label>
                    <Input value={pdfSemanaFin} onChange={(e) => setPdfSemanaFin(e.target.value)} placeholder="33" />
                  </div>
                </>
              )}
              {pdfMode === "quincena" && (
                <>
                  <div className="space-y-2">
                    <Label>Mes</Label>
                    <Select value={pdfMes} onValueChange={setPdfMes}>
                      <SelectTrigger><SelectValue placeholder="Mes" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Enero</SelectItem>
                        <SelectItem value="2">Febrero</SelectItem>
                        <SelectItem value="3">Marzo</SelectItem>
                        <SelectItem value="4">Abril</SelectItem>
                        <SelectItem value="5">Mayo</SelectItem>
                        <SelectItem value="6">Junio</SelectItem>
                        <SelectItem value="7">Julio</SelectItem>
                        <SelectItem value="8">Agosto</SelectItem>
                        <SelectItem value="9">Septiembre</SelectItem>
                        <SelectItem value="10">Octubre</SelectItem>
                        <SelectItem value="11">Noviembre</SelectItem>
                        <SelectItem value="12">Diciembre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quincena</Label>
                    <Select value={pdfQuincena} onValueChange={setPdfQuincena}>
                      <SelectTrigger><SelectValue placeholder="Quincena" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1ª (1–15)</SelectItem>
                        <SelectItem value="2">2ª (16–fin)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label>Año</Label>
                <Input value={pdfAño} onChange={(e) => setPdfAño(e.target.value)} placeholder="2025" />
              </div>
              <div className="space-y-2">
                <Label>Elaborado por</Label>
                <Input value={pdfElaborado} onChange={(e) => setPdfElaborado(e.target.value)} placeholder="" />
              </div>
              <div className="space-y-2">
                <Label>Revisado por</Label>
                <Input value={pdfRevisado} onChange={(e) => setPdfRevisado(e.target.value)} placeholder="" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                onClick={async () => {
                  const yr = Number(pdfAño || '0');
                  let s = 0, e = 0;
                  let filtered = rolesPago || [];
                  if (pdfMode === 'semanas') {
                    s = Number(pdfSemanaInicio || '0');
                    e = Number(pdfSemanaFin || (s ? String(s + 1) : '0'));
                    filtered = filtered.filter((r) => r.año === yr && (r.semana || 0) >= s && (r.semana || 0) <= e);
                  } else {
                    const mes = Number(pdfMes || '1');
                    const startDay = pdfQuincena === '1' ? 1 : 16;
                    const endDay = pdfQuincena === '1' ? 15 : new Date(yr, mes, 0).getDate();
                    const from = new Date(yr, mes - 1, startDay);
                    const to = new Date(yr, mes - 1, endDay);
                    filtered = filtered.filter((r) => {
                      const d = r.fecha ? new Date(r.fecha) : getDateFromYearSemana(r.año || 2025, r.semana || 1);
                      return d >= from && d <= to;
                    });
                    const weeks = filtered.map((r) => r.semana || 0).filter((w): w is number => w > 0);
                    s = weeks.length ? Math.min(...weeks) : 0;
                    e = weeks.length ? Math.max(...weeks) : 0;
                  }
                  const roles = filtered.filter((r) => r.finca === pdfFinca);
                  await exportRolPagoPDFCatorcenal({
                    productor: '',
                    finca: pdfFinca,
                    ubicacion: '',
                    semanaInicio: s,
                    semanaFin: e,
                    año: yr,
                    mes: pdfMode === 'quincena' ? Number(pdfMes || '1') : undefined,
                    quincena: pdfMode === 'quincena' ? Number(pdfQuincena || '1') : undefined,
                    superficie: undefined,
                    roles: roles.map((r) => ({
                      empleado: { nombre: (r as any).empleadoNombre || r.empleado?.nombre, cedula: r.empleado?.cedula, labor: r.empleado?.labor },
                      diasLaborados: r.diasLaborados,
                      sueldoBase: r.sueldoBase,
                      cosecha: r.cosecha,
                      tareasEspeciales: r.tareasEspeciales,
                      totalIngresos: r.totalIngresos,
                      prestamos: r.prestamos,
                      multas: r.multas,
                      totalEgresos: r.totalEgresos,
                      netoAPagar: r.netoAPagar,
                    })),
                    elaboradoPor: pdfElaborado,
                    revisadoPor: pdfRevisado,
                    fechaRevision: new Date().toISOString().split("T")[0],
                  });
                  setPdfOpen(false);
                }}
              >
                Generar PDF
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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

        <div className="flex items-center gap-2 mb-4">
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
            <Select value={sortDir} onValueChange={(v) => { setSortDir(v as any); setPage(1); }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Más recientes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Más recientes</SelectItem>
                <SelectItem value="asc">Más antiguos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {paginated.length === 0 ? (
          <div className="flex items-center justify-center rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No hay roles de pago para los filtros actuales.
          </div>
        ) : (
          <div key={`${pageSize}-${page}`} className="overflow-x-auto overflow-y-auto max-h-[540px] animate-in fade-in duration-200 rounded-md border border-border responsive-table">
            <Table className="text-sm table-auto md:table-fixed min-w-[1000px]">
              <TableHeader className="sticky top-0 z-10 bg-background shadow-sm text-xs md:text-sm">
              <TableRow>
                <TableHead className="truncate max-w-[160px]">Empleado</TableHead>
                <TableHead>Semana</TableHead>
                <TableHead>
                  <button
                    className="flex items-center gap-1"
                    onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                  >
                    Fecha {sortDir === "asc" ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="text-right">Días</TableHead>
                <TableHead className="text-right">H. Extras</TableHead>
                <TableHead className="text-right">Ingresos</TableHead>
                <TableHead className="text-right">Descuentos</TableHead>
                <TableHead className="text-right">Neto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[120px] min-w-[120px] text-right">Acción</TableHead>
              </TableRow>
              </TableHeader>
              <TableBody className="animate-in fade-in duration-200">
                {paginated.map((rol) => (
                <TableRow key={rol.id} className="odd:bg-muted/50 hover:bg-muted transition-colors">
                  <TableCell className="font-medium truncate max-w-[160px]">
                    {(rol as any).empleadoNombre || rol.empleado?.nombre || "N/A"}
                  </TableCell>
                  <TableCell>S{rol.semana}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {(() => {
                      const fecha = rol.fecha || rol.fechaPago;
                      if (fecha) {
                        const d = new Date(fecha);
                        return isNaN(d.getTime()) ? `S${rol.semana || 0}/${rol.año || 0}` : d.toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "numeric" });
                      }
                      if (rol.año && rol.semana) {
                        return getDateFromYearSemana(rol.año, rol.semana).toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "numeric" });
                      }
                      return `S${rol.semana || 0}/${rol.año || 0}`;
                    })()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums whitespace-nowrap">
                    {rol.diasLaborados || 0}
                  </TableCell>
                  <TableCell className="text-right tabular-nums whitespace-nowrap">
                    {rol.horasExtras || 0}
                  </TableCell>
                  <TableCell className="text-right tabular-nums whitespace-nowrap text-green-600">
                    ${(rol.totalIngresos || 0).toLocaleString("es-EC", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right tabular-nums whitespace-nowrap text-red-600">
                    ${(rol.totalEgresos || 0).toLocaleString("es-EC", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right font-bold tabular-nums whitespace-nowrap">
                    ${(rol.netoAPagar || 0).toLocaleString("es-EC", { minimumFractionDigits: 2 })}
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
                  <TableCell className="w-[120px] min-w-[120px] text-right">
                    <div className="inline-flex items-center justify-end gap-1">
                      {rol.estado === "pendiente" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 bg-transparent"
                          onClick={() => updateRolPagoEstado(rol.id, "pagado")}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Pagar
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
                <PaginationPrevious href="#" disabled={page <= 1} onClick={(e) => { e.preventDefault(); if (page > 1) setPage((p) => Math.max(1, p - 1)); }} />
              </PaginationItem>
              {Array.from({ length: pageCount }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink href="#" isActive={page === i + 1} onClick={(e) => { e.preventDefault(); setPage(i + 1); }}>
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext href="#" disabled={page >= pageCount} onClick={(e) => { e.preventDefault(); if (page < pageCount) setPage((p) => Math.min(pageCount, p + 1)); }} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
}
