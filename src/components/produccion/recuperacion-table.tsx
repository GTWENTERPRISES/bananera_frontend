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
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useMemo } from "react";
import { Badge } from "@/src/components/ui/badge";
import { ExportButton } from "@/src/components/shared/export-button";
import { cn } from "@/src/lib/utils";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/src/components/ui/pagination";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/src/components/ui/alert-dialog";
import { Button as Btn } from "@/src/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function RecuperacionTable() {
  const { recuperacionCintas, enfundes, updateRecuperacionCinta, deleteRecuperacionCinta } = useApp();
  const searchParams = useSearchParams();
  const fincaFilter = searchParams.get("finca") || "";
  const [fincaSel, setFincaSel] = useState(fincaFilter);
  const router = useRouter();
  const pathname = usePathname();
  const [weekFilter, setWeekFilter] = useState(searchParams.get("semana") || "");
  const [sortBy, setSortBy] = useState<
    "fecha" | "finca" | "semana" | "color" | "enfundesIniciales" | "primeraCalCosecha" | "segundaCalCosecha" | "terceraCalCosecha" | "barridaFinal" | "porcentajeRecuperacion"
  >("fecha");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const latestRecord = useMemo(() => {
    let best: typeof recuperacionCintas[number] | null = null;
    for (const r of recuperacionCintas) {
      if (!best) best = r;
      else if (r.año > (best as any).año || (r.año === (best as any).año && r.semana > (best as any).semana)) best = r;
    }
    return best;
  }, [recuperacionCintas]);

  

  const filtered = useMemo(() => {
    return recuperacionCintas.filter((r) => {
      const matchesFinca = fincaSel ? r.finca === fincaSel : true;
      const matchesWeek = weekFilter ? r.semana === Number(weekFilter) : true;
      return matchesFinca && matchesWeek;
    });
  }, [recuperacionCintas, fincaSel, weekFilter]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    const v = searchParams.get("pageSize");
    const n = v ? Number(v) : 10;
    return [10, 20, 50].includes(n) ? n : 10;
  });
  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = (page - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const sorted = useMemo(() => {
    const getValue = (r: typeof recuperacionCintas[number]) => {
      if (sortBy === "fecha") return (r.fecha ? new Date(r.fecha) : getDateFromYearSemana(r.año, r.semana)).getTime();
      if (sortBy === "finca") return r.finca.toLowerCase();
      if (sortBy === "semana") return r.semana;
      if (sortBy === "color") {
        const match = enfundes.find(e => e.finca === r.finca && e.semana === r.semana && e.año === r.año);
        const color = r.colorCinta || match?.colorCinta || "";
        return color.toLowerCase();
      }
      if (sortBy === "enfundesIniciales") return r.enfundesIniciales;
      if (sortBy === "primeraCalCosecha") return r.primeraCalCosecha;
      if (sortBy === "segundaCalCosecha") return r.segundaCalCosecha;
      if (sortBy === "terceraCalCosecha") return r.terceraCalCosecha;
      if (sortBy === "barridaFinal") return r.barridaFinal;
      if (sortBy === "porcentajeRecuperacion") return r.porcentajeRecuperacion;
      return 0;
    };
    const arr = [...filtered];
    arr.sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortBy, sortDir]);

  const paginated = sorted.slice(startIdx, endIdx);
  const applyLatestFilters = () => {
    if (!latestRecord) return;
    const nextWeek = String(latestRecord.semana);
    setWeekFilter(nextWeek);
    const params = new URLSearchParams();
    for (const [key, value] of (searchParams as any).entries?.() || []) params.set(key, value);
    params.set("semana", nextWeek);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setPage(1);
  };

  const toggleSort = (key: typeof sortBy) => {
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(key);
      setSortDir(key === "semana" ? "desc" : "asc");
    }
    setPage(1);
  };

  const avgRecuperacion =
    filtered.reduce((sum, r) => sum + r.porcentajeRecuperacion, 0) /
    (filtered.length || 1);

  const pageTotals = useMemo(() => {
    const arr = paginated;
    const totals = {
      enfundesIniciales: 0,
      primeraCal: 0,
      segundaCal: 0,
      terceraCal: 0,
      barrida: 0,
      recuperado: 0,
      percSum: 0,
      count: arr.length,
    };
    for (const r of arr) {
      totals.enfundesIniciales += r.enfundesIniciales;
      totals.primeraCal += r.primeraCalCosecha;
      totals.segundaCal += r.segundaCalCosecha;
      totals.terceraCal += r.terceraCalCosecha;
      totals.barrida += r.barridaFinal;
      totals.recuperado += r.primeraCalCosecha + r.segundaCalCosecha + r.terceraCalCosecha + r.barridaFinal;
      totals.percSum += r.porcentajeRecuperacion;
    }
    const percAvg = totals.count ? totals.percSum / totals.count : 0;
    return { ...totals, percAvg };
  }, [paginated]);

  const getRecuperacionColor = (porcentaje: number) => {
    if (porcentaje >= 90) return "text-green-600";
    if (porcentaje >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const colorMap: { [key: string]: string } = {
    azul: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    rojo: "bg-red-100 text-red-800 hover:bg-red-200",
    verde: "bg-green-100 text-green-800 hover:bg-green-200",
    amarillo: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    naranja: "bg-orange-100 text-orange-800 hover:bg-orange-200",
    violeta: "bg-violet-100 text-violet-800 hover:bg-violet-200",
    morado: "bg-violet-100 text-violet-800 hover:bg-violet-200",
    purpura: "bg-fuchsia-100 text-fuchsia-800 hover:bg-fuchsia-200",
    celeste: "bg-cyan-100 text-cyan-800 hover:bg-cyan-200",
    negro: "bg-gray-800 text-white hover:bg-gray-700",
    cafe: "bg-amber-200 text-amber-800 hover:bg-amber-300",
    marron: "bg-amber-200 text-amber-800 hover:bg-amber-300",
    gris: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    blanco: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  };

  const getBadgeClass = (color?: string) => {
    const c = (color || "").toLowerCase();
    return colorMap[c] || "bg-gray-100 text-gray-800 hover:bg-gray-200";
  };

  function getDateFromYearSemana(year: number, week: number) {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dayOfWeek = simple.getDay();
    const ISOweekStart = new Date(simple);
    if (dayOfWeek <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
  }

  const [editing, setEditing] = useState<null | typeof recuperacionCintas[number]>(null);
  const [editForm, setEditForm] = useState({ colorCinta: "", enfundesIniciales: "", primeraCalCosecha: "", segundaCalCosecha: "", terceraCalCosecha: "", barridaFinal: "" });
  const [toDelete, setToDelete] = useState<null | typeof recuperacionCintas[number]>(null);

  const openEdit = (r: typeof recuperacionCintas[number]) => {
    setEditing(r);
    setEditForm({
      colorCinta: r.colorCinta || "",
      enfundesIniciales: String(r.enfundesIniciales),
      primeraCalCosecha: String(r.primeraCalCosecha),
      segundaCalCosecha: String(r.segundaCalCosecha),
      terceraCalCosecha: String(r.terceraCalCosecha),
      barridaFinal: String(r.barridaFinal),
    });
  };

  const saveEdit = () => {
    if (!editing) return;
    const color = editForm.colorCinta;
    const enf = Number.parseInt(editForm.enfundesIniciales || "0");
    const p1 = Number.parseInt(editForm.primeraCalCosecha || "0");
    const p2 = Number.parseInt(editForm.segundaCalCosecha || "0");
    const p3 = Number.parseInt(editForm.terceraCalCosecha || "0");
    const barr = Number.parseInt(editForm.barridaFinal || "0");
    const p1s = Math.max(0, enf - p1);
    const p2s = Math.max(0, p1s - p2);
    const p3s = Math.max(0, p2s - p3);
    const recuperado = p1 + p2 + p3 + barr;
    const porcentajeRecuperacion = enf > 0 ? (recuperado / enf) * 100 : 0;
    updateRecuperacionCinta(editing.id, {
      colorCinta: color,
      enfundesIniciales: enf,
      primeraCalCosecha: p1,
      primeraCalSaldo: p1s,
      segundaCalCosecha: p2,
      segundaCalSaldo: p2s,
      terceraCalCosecha: p3,
      terceraCalSaldo: p3s,
      barridaFinal: barr,
      porcentajeRecuperacion: Number.parseFloat(porcentajeRecuperacion.toFixed(1)),
    });
    toast.success("Recuperación actualizada");
    setEditing(null);
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    deleteRecuperacionCinta(toDelete.id);
    toast.success("Registro eliminado");
    setToDelete(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Historial de Recuperación</CardTitle>
        <ExportButton
          data={filtered.map(rec => {
            const match = enfundes.find(e => e.finca === rec.finca && e.semana === rec.semana && e.año === rec.año);
            return { ...rec, colorCinta: rec.colorCinta || match?.colorCinta || "" };
          })}
          headers={[
            "Finca",
            "Semana",
            "Color",
            "Enfunde",
            "1ª Cal",
            "2ª Cal",
            "3ª Cal",
            "Barrida",
            "Recuperación",
          ]}
          keys={[
            "finca",
            "semana",
            "colorCinta",
            "enfundesIniciales",
            "primeraCalCosecha",
            "segundaCalCosecha",
            "terceraCalCosecha",
            "barridaFinal",
            "porcentajeRecuperacion",
          ]}
          title="Historial de Recuperación"
          filename="recuperacion-cintas"
          enableFilter
          weekField="semana"
          yearField="año"
        />
      </CardHeader>
      <CardContent>
        {latestRecord && (
          <div className="mb-4 rounded-lg border border-border bg-muted/40 p-3 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Último registro: <span className="font-medium text-foreground">{latestRecord.finca}</span> · S{latestRecord.semana} · {latestRecord.año}</div>
            <Button variant="outline" size="sm" onClick={applyLatestFilters}>Ver</Button>
          </div>
        )}
        <div className="mb-4 rounded-lg border border-border bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">Recuperación Promedio</p>
          <p
            className={cn(
              "text-2xl font-bold",
              getRecuperacionColor(avgRecuperacion)
            )}
          >
            {avgRecuperacion.toFixed(1)}%
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Finca</span>
            <Select value={fincaSel} onValueChange={(v) => { const next = v === "todas" ? "" : v; setFincaSel(next); const params = new URLSearchParams(); for (const [key, value] of (searchParams as any).entries?.() || []) { params.set(key, value); } if (next) params.set("finca", next); else params.delete("finca"); router.replace(`${pathname}?${params.toString()}`, { scroll: false }); setPage(1); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="BABY">BABY</SelectItem>
                <SelectItem value="SOLO">SOLO</SelectItem>
                <SelectItem value="LAURITA">LAURITA</SelectItem>
                <SelectItem value="MARAVILLA">MARAVILLA</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ver</span>
            <Select value={String(pageSize)} onValueChange={(v) => { const next = Number(v); setPageSize(next); const params = new URLSearchParams(); for (const [key, value] of (searchParams as any).entries?.() || []) { params.set(key, value); } params.set("pageSize", String(next)); router.replace(`${pathname}?${params.toString()}`, { scroll: false }); setPage(1); }}>
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
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Semana</span>
            <Input type="number" min="1" max="53" value={weekFilter} onChange={(e) => { const next = e.target.value; setWeekFilter(next); const params = new URLSearchParams(); for (const [key, value] of (searchParams as any).entries?.() || []) { params.set(key, value); } if (next) params.set("semana", next); else params.delete("semana"); router.replace(`${pathname}?${params.toString()}`, { scroll: false }); setPage(1); }} className="w-[100px]" />
          </div>
          <Button variant="ghost" onClick={() => { setWeekFilter(""); const params = new URLSearchParams(); for (const [key, value] of (searchParams as any).entries?.() || []) { params.set(key, value); } params.delete("semana"); router.replace(`${pathname}?${params.toString()}`, { scroll: false }); setPage(1); }}>Limpiar filtros</Button>
        </div>

        {paginated.length === 0 ? (
          <div className="flex items-center justify-center rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No hay registros de recuperación para los filtros seleccionados.
          </div>
        ) : (
        <div key={`${fincaSel}-${weekFilter}`} className="overflow-x-auto overflow-y-auto max-h-[540px] animate-in fade-in duration-200 rounded-md border border-border responsive-table">
          <Table className="text-sm table-auto md:table-fixed min-w-[950px] md:min-w-[1100px] lg:min-w-[1200px]">
            <TableHeader className="sticky top-0 z-10 bg-background shadow-sm text-xs md:text-sm">
              <TableRow>
                <TableHead>
                  <button className="flex items-center gap-1" onClick={() => toggleSort("fecha")}>Fecha {sortBy === "fecha" ? (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : null}</button>
                </TableHead>
                <TableHead>Finca</TableHead>
                <TableHead>
                  <button className="flex items-center gap-1" onClick={() => toggleSort("semana")}>Semana {sortBy === "semana" ? (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : null}</button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1" onClick={() => toggleSort("color")}>Color {sortBy === "color" ? (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : null}</button>
                </TableHead>
                <TableHead className="text-right">
                  <button className="flex items-center gap-1" onClick={() => toggleSort("enfundesIniciales")}>Enfunde {sortBy === "enfundesIniciales" ? (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : null}</button>
                </TableHead>
                <TableHead className="text-right">
                  <button className="flex items-center gap-1" onClick={() => toggleSort("primeraCalCosecha")}>1ª Cal {sortBy === "primeraCalCosecha" ? (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : null}</button>
                </TableHead>
                <TableHead className="text-right">
                  <button className="flex items-center gap-1" onClick={() => toggleSort("segundaCalCosecha")}>2ª Cal {sortBy === "segundaCalCosecha" ? (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : null}</button>
                </TableHead>
                <TableHead className="text-right">
                  <button className="flex items-center gap-1" onClick={() => toggleSort("terceraCalCosecha")}>3ª Cal {sortBy === "terceraCalCosecha" ? (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : null}</button>
                </TableHead>
                <TableHead className="text-right">
                  <button className="flex items-center gap-1" onClick={() => toggleSort("barridaFinal")}>Barrida {sortBy === "barridaFinal" ? (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : null}</button>
                </TableHead>
                <TableHead className="text-right">
                  <button className="flex items-center gap-1" onClick={() => toggleSort("porcentajeRecuperacion")}>Recuperación {sortBy === "porcentajeRecuperacion" ? (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : null}</button>
                </TableHead>
                <TableHead className="w-[84px] min-w-[84px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="animate-in fade-in duration-200">
              {paginated.map((rec) => {
                const match = enfundes.find(e => e.finca === rec.finca && e.semana === rec.semana && e.año === rec.año);
                const color = rec.colorCinta || match?.colorCinta;
                return (
                <TableRow key={rec.id} className="odd:bg-muted/50 hover:bg-muted transition-colors">
                  <TableCell className="whitespace-nowrap">
                    {(rec.fecha ? new Date(rec.fecha) : getDateFromYearSemana(rec.año, rec.semana)).toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "numeric" })}
                  </TableCell>
                  <TableCell className="font-medium truncate max-w-[160px]">{rec.finca}</TableCell>
                  <TableCell className="tabular-nums whitespace-nowrap">S{rec.semana}</TableCell>
                  <TableCell>
                    {color ? (
                      <Badge className={getBadgeClass(color)}>{color}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums whitespace-nowrap">
                    {rec.enfundesIniciales}
                  </TableCell>
                  <TableCell className="text-right tabular-nums whitespace-nowrap">
                    {rec.primeraCalCosecha}
                  </TableCell>
                  <TableCell className="text-right tabular-nums whitespace-nowrap">
                    {rec.segundaCalCosecha}
                  </TableCell>
                  <TableCell className="text-right tabular-nums whitespace-nowrap">
                    {rec.terceraCalCosecha}
                  </TableCell>
                  <TableCell className="text-right tabular-nums whitespace-nowrap">
                    {rec.barridaFinal}
                  </TableCell>
                  <TableCell className="text-right tabular-nums whitespace-nowrap">
                    <Badge
                      variant={
                        rec.porcentajeRecuperacion >= 80
                          ? "default"
                          : "destructive"
                      }
                      className={cn(
                        getRecuperacionColor(rec.porcentajeRecuperacion)
                      )}
                    >
                      {rec.porcentajeRecuperacion.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="w-[84px] min-w-[84px] text-right">
                    <div className="inline-flex items-center justify-end gap-1">
                      <Btn variant="ghost" size="icon" onClick={() => openEdit(rec)}>
                        <Edit className="h-4 w-4" />
                      </Btn>
                      <Btn variant="ghost" size="icon" onClick={() => setToDelete(rec)}>
                        <Trash2 className="h-4 w-4" />
                      </Btn>
                    </div>
                  </TableCell>
                </TableRow>
              )})}
              <TableRow className="bg-muted/50">
                <TableCell className="font-semibold">TOTAL</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell className="text-right tabular-nums whitespace-nowrap">{pageTotals.enfundesIniciales.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums whitespace-nowrap">{pageTotals.primeraCal.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums whitespace-nowrap">{pageTotals.segundaCal.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums whitespace-nowrap">{pageTotals.terceraCal.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums whitespace-nowrap">{pageTotals.barrida.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums whitespace-nowrap">
                  <Badge>{pageTotals.percAvg.toFixed(1)}%</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        )}
        <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Recuperación</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2"><span className="text-sm text-muted-foreground">Color</span>
                <Select value={editForm.colorCinta} onValueChange={(v) => setEditForm({ ...editForm, colorCinta: v })}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Seleccionar color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Azul">Azul</SelectItem>
                    <SelectItem value="Rojo">Rojo</SelectItem>
                    <SelectItem value="Verde">Verde</SelectItem>
                    <SelectItem value="Amarillo">Amarillo</SelectItem>
                    <SelectItem value="Blanco">Blanco</SelectItem>
                    <SelectItem value="Naranja">Naranja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><span className="text-sm text-muted-foreground">Enfunde</span><Input className="h-11" type="number" value={editForm.enfundesIniciales} onChange={(e) => setEditForm({ ...editForm, enfundesIniciales: e.target.value })} /></div>
              <div className="space-y-2"><span className="text-sm text-muted-foreground">1ª Cal</span><Input className="h-11" type="number" value={editForm.primeraCalCosecha} onChange={(e) => setEditForm({ ...editForm, primeraCalCosecha: e.target.value })} /></div>
              <div className="space-y-2"><span className="text-sm text-muted-foreground">2ª Cal</span><Input className="h-11" type="number" value={editForm.segundaCalCosecha} onChange={(e) => setEditForm({ ...editForm, segundaCalCosecha: e.target.value })} /></div>
              <div className="space-y-2"><span className="text-sm text-muted-foreground">3ª Cal</span><Input className="h-11" type="number" value={editForm.terceraCalCosecha} onChange={(e) => setEditForm({ ...editForm, terceraCalCosecha: e.target.value })} /></div>
              <div className="space-y-2"><span className="text-sm text-muted-foreground">Barrida</span><Input className="h-11" type="number" value={editForm.barridaFinal} onChange={(e) => setEditForm({ ...editForm, barridaFinal: e.target.value })} /></div>
            </div>
            <div className="flex flex-col md:flex-row justify-end gap-2 mt-4">
              <Btn className="h-11" variant="secondary" onClick={() => setEditing(null)}>Cancelar</Btn>
              <Btn className="h-11" onClick={saveEdit}>Guardar</Btn>
            </div>
          </DialogContent>
        </Dialog>
        <AlertDialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar registro</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>Eliminar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
  );
}
