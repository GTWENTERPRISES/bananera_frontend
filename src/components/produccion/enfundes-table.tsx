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
import { useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Search, Edit, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/src/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/src/components/ui/alert-dialog";
import { toast } from "sonner";
import { useIsMobile } from "@/src/hooks/use-mobile";

// Extender Date para getWeek si no existe
declare global {
  interface Date {
    getWeek(): number;
  }
}

Date.prototype.getWeek = function () {
  const date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
};

// Mapeo de colores para los badges
const colorMap: { [key: string]: string } = {
  azul: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  rojo: "bg-red-100 text-red-800 hover:bg-red-200",
  verde: "bg-green-100 text-green-800 hover:bg-green-200",
  amarillo: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  naranja: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  violeta: "bg-violet-100 text-violet-800 hover:bg-violet-200",
  morado: "bg-violet-100 text-violet-800 hover:bg-violet-200",
  gris: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  blanco: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  negro: "bg-gray-800 text-white hover:bg-gray-700",
  celeste: "bg-cyan-100 text-cyan-800 hover:bg-cyan-200",
  purpura: "bg-fuchsia-100 text-fuchsia-800 hover:bg-fuchsia-200",
};

export function EnfundesTable() {
  const { enfundes, fincas, updateEnfunde, deleteEnfunde, replaceEnfundes } = useApp();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const searchParams = useSearchParams();
  const fincaFilter = searchParams.get("finca") || "";
  const [fincaSel, setFincaSel] = useState(fincaFilter);
  const router = useRouter();
  const pathname = usePathname();
  const [weekFilter, setWeekFilter] = useState(searchParams.get("semana") || "");
  const [yearFilter, setYearFilter] = useState(searchParams.get("anio") || "");
  const [startDate, setStartDate] = useState(searchParams.get("desde") || "");
  const [endDate, setEndDate] = useState(searchParams.get("hasta") || "");
  const [sortBy, setSortBy] = useState<
    "fecha" | "finca" | "semana" | "año" | "colorCinta" | "cantidadEnfundes" | "matasCaidas" | "responsable"
  >("fecha");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const latestRecord = useMemo(() => {
    let best: typeof enfundes[number] | null = null;
    for (const e of enfundes) {
      if (!best) best = e;
      else {
        const da = new Date(e.fecha).getTime();
        const db = new Date(best.fecha).getTime();
        if (da > db) best = e;
        else if (da === db && (e.año > (best as any).año || (e.año === (best as any).año && e.semana > (best as any).semana))) best = e;
      }
    }
    return best;
  }, [enfundes]);

  const years = useMemo(() => {
    return Array.from(new Set(enfundes.map((e) => e.año))).sort((a, b) => a - b);
  }, [enfundes]);

  const fincaOptions = useMemo(() => {
    return Array.from(new Set(fincas.map((f) => f.nombre)));
  }, [fincas]);

  // Función para obtener información de la finca
  const getFincaInfo = (fincaName: string) => {
    return fincas.find((f) => f.nombre === fincaName);
  };

  const filteredEnfundes = useMemo(() => {
    return enfundes.filter((enfunde) => {
      const matchesSearch =
        enfunde.finca.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enfunde.colorCinta.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFinca = fincaSel ? enfunde.finca === fincaSel : true;
      const matchesWeek = weekFilter ? enfunde.semana === Number(weekFilter) : true;
      const matchesYear = yearFilter ? enfunde.año === Number(yearFilter) : true;
      const d = new Date(enfunde.fecha);
      const matchesStart = startDate ? d >= new Date(startDate) : true;
      const matchesEnd = endDate ? d <= new Date(endDate) : true;
      return (
        matchesSearch &&
        matchesFinca &&
        matchesWeek &&
        matchesYear &&
        matchesStart &&
        matchesEnd
      );
    });
  }, [enfundes, searchTerm, fincaSel, weekFilter, yearFilter, startDate, endDate]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    const v = searchParams.get("pageSize");
    const n = v ? Number(v) : 10;
    return [10, 20, 50].includes(n) ? n : 10;
  });
  const sortedEnfundes = useMemo(() => {
    const getValue = (e: typeof enfundes[number]) => {
      if (sortBy === "fecha") return new Date(e.fecha).getTime();
      if (sortBy === "finca") return e.finca.toLowerCase();
      if (sortBy === "semana") return e.semana;
      if (sortBy === "año") return e.año;
      if (sortBy === "colorCinta") return e.colorCinta.toLowerCase();
      if (sortBy === "cantidadEnfundes") return e.cantidadEnfundes;
      if (sortBy === "matasCaidas") return e.matasCaidas;
      if (sortBy === "responsable") return (getFincaInfo(e.finca)?.responsable || "").toLowerCase();
      return 0;
    };
    const arr = [...filteredEnfundes];
    arr.sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      let cmp = 0;
      if (typeof va === "number" && typeof vb === "number") cmp = va - vb;
      else cmp = String(va).localeCompare(String(vb));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filteredEnfundes, sortBy, sortDir]);

  const total = sortedEnfundes.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = (page - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const paginated = sortedEnfundes.slice(startIdx, endIdx);
  const applyLatestFilters = () => {
    if (!latestRecord) return;
    const nextWeek = String(latestRecord.semana);
    const nextYear = String(latestRecord.año);
    const nextFinca = latestRecord.finca;
    setWeekFilter(nextWeek);
    setYearFilter(nextYear);
    setFincaSel(nextFinca);
    const params = new URLSearchParams(searchTerm ? [["q", searchTerm]] : []);
    for (const [key, value] of (searchParams as any).entries?.() || []) params.set(key, value);
    params.set("semana", nextWeek);
    params.set("anio", nextYear);
    params.set("finca", nextFinca);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setPage(1);
  };

  const toggleSort = (key: typeof sortBy) => {
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(key);
      setSortDir(key === "fecha" ? "desc" : "asc");
    }
    setPage(1);
  };

  const totalEnfundes = enfundes.reduce(
    (sum, e) => sum + e.cantidadEnfundes,
    0
  );
  const totalMatasCaidas = enfundes.reduce((sum, e) => sum + e.matasCaidas, 0);

  const pageTotals = useMemo(() => {
    let enf = 0;
    let matas = 0;
    for (const e of paginated) {
      enf += e.cantidadEnfundes;
      matas += e.matasCaidas;
    }
    return { enf, matas };
  }, [paginated]);

  // Función segura para obtener la clase del badge
  const getBadgeClass = (color: string) => {
    const colorLower = color.toLowerCase();
    return (
      colorMap[colorLower] || "bg-gray-100 text-gray-800 hover:bg-gray-200"
    );
  };

  // Importar desde Excel/CSV
  const [importing, setImporting] = useState(false);
  const handleImport = async (file: File) => {
    try {
      setImporting(true);
      const XLSX = await import("xlsx");
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const norm = (s: any) => String(s || "").trim();
      const toInt = (v: any) => {
        const n = Number(String(v).replace(/[^0-9.-]/g, ""));
        return Number.isFinite(n) ? n : 0;
      };
      const colorNorm = (c: string) => {
        const x = c.toLowerCase();
        if (x.includes("azul")) return "Azul";
        if (x.includes("rojo")) return "Rojo";
        if (x.includes("verde")) return "Verde";
        if (x.includes("amar")) return "Amarillo";
        if (x.includes("naranja")) return "Naranja";
        if (x.includes("blanco")) return "Blanco";
        if (x.includes("negro")) return "Negro";
        if (x.includes("morado") || x.includes("violeta") || x.includes("purp")) return "Violeta";
        return c || "";
      };
      const dateFromWeek = (year: number, week: number) => {
        const simple = new Date(year, 0, 1 + (week - 1) * 7);
        const dayOfWeek = simple.getDay();
        const ISOweekStart = simple;
        if (dayOfWeek <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
        else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
        const y = ISOweekStart.getFullYear();
        const m = String(ISOweekStart.getMonth() + 1).padStart(2, "0");
        const d = String(ISOweekStart.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
      };

      const imported = rows.map((r, i) => {
        const finca = norm(r.Finca || r.finca || r.FINCA);
        const semana = toInt(r.Semana || r.SEM || r.sem || r.week);
        const anio = toInt(r.Año || r.ANIO || r.anio || r.year);
        const color = colorNorm(norm(r.Color || r.COLOR || r.color));
        const enf = toInt(r.Enfunde || r.ENFUNDE || r.enfunde || r.Cantidad || r.cantidad);
        const matas = toInt(r["Matas Caidas"] || r.MATAS || r.matas || r.matasCaidas);
        const fecha = norm(r.Fecha || r.fecha) || dateFromWeek(anio || new Date().getFullYear(), semana || 1);
        return {
          id: `imp-${Date.now()}-${i}`,
          finca: finca as any,
          semana,
          año: anio,
          colorCinta: color,
          cantidadEnfundes: enf,
          matasCaidas: matas,
          fecha,
        } as any;
      }).filter((e) => e.finca && e.semana && e.año);

      if (!imported.length) {
        toast.error("No se encontraron registros válidos en el archivo");
      } else {
        replaceEnfundes(imported as any);
        toast.success(`Importados ${imported.length} registros de enfundes`);
      }
    } catch (err) {
      toast.error("Error importando archivo de enfundes");
    } finally {
      setImporting(false);
    }
  };

  const [editing, setEditing] = useState<null | typeof enfundes[number]>(null);
  const [editForm, setEditForm] = useState({ colorCinta: "", cantidadEnfundes: "", matasCaidas: "", fecha: "" });
  const [toDelete, setToDelete] = useState<null | typeof enfundes[number]>(null);

  const openEdit = (e: typeof enfundes[number]) => {
    setEditing(e);
    setEditForm({
      colorCinta: e.colorCinta,
      cantidadEnfundes: String(e.cantidadEnfundes),
      matasCaidas: String(e.matasCaidas),
      fecha: e.fecha.split("T")[0] || e.fecha,
    });
  };

  const saveEdit = () => {
    if (!editing) return;
    const cantidad = Number.parseInt(editForm.cantidadEnfundes || "0");
    const matas = Number.parseInt(editForm.matasCaidas || "0");
    updateEnfunde(editing.id, {
      colorCinta: editForm.colorCinta,
      cantidadEnfundes: cantidad,
      matasCaidas: matas,
      fecha: editForm.fecha,
    });
    toast.success("Enfunde actualizado");
    setEditing(null);
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    deleteEnfunde(toDelete.id);
    toast.success("Enfunde eliminado");
    setToDelete(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Registro de Enfundes</CardTitle>
        <div className="flex items-center gap-2">
          <input id="enfundes-import" type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImport(f); e.currentTarget.value = ""; }} />
          <Button variant="secondary" disabled={importing} onClick={() => document.getElementById("enfundes-import")?.click()}>
            {importing ? "Importando..." : "Importar"}
          </Button>
          <ExportButton
          data={filteredEnfundes.map(e => ({
            ...e,
            responsable: getFincaInfo(e.finca)?.responsable || "No asignado",
          }))}
          headers={[
            "Fecha",
            "Finca",
            "Semana",
            "Año",
            "Color",
            "Enfundes",
            "Matas Caídas",
            "Responsable",
          ]}
          keys={[
            "fecha",
            "finca",
            "semana",
            "año",
            "colorCinta",
            "cantidadEnfundes",
            "matasCaidas",
            "responsable",
          ]}
          title="Registro de Enfundes"
          filename="registro-enfundes"
          enableFilter
          dateField="fecha"
          weekField="semana"
          yearField="año"
        />
        </div>
      </CardHeader>
      <CardContent>
        {latestRecord && (
          <div className="mb-4 rounded-lg border border-border bg-muted/40 p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
            <div className="text-xs md:text-sm text-muted-foreground">Último registro: <span className="font-medium text-foreground">{latestRecord.finca}</span> · S{latestRecord.semana} · {latestRecord.año} · {latestRecord.colorCinta} · {latestRecord.cantidadEnfundes.toLocaleString()} enfundes</div>
            <Button variant="outline" size="sm" onClick={applyLatestFilters}>Ver</Button>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Enfundes</p>
            <p className="text-lg md:text-2xl font-bold text-foreground">
              {totalEnfundes.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Matas Caídas</p>
            <p className="text-lg md:text-2xl font-bold text-destructive">
              {totalMatasCaidas.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Semana Actual</p>
            <p className="text-lg md:text-2xl font-bold text-foreground">
              {new Date().getWeek()}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Finca</span>
            <Select value={fincaSel} onValueChange={(v) => { const next = v === "todas" ? "" : v; setFincaSel(next); const params = new URLSearchParams(searchTerm ? [["q", searchTerm]] : []); for (const [key, value] of (searchParams as any).entries?.() || []) { params.set(key, value); } if (next) params.set("finca", next); else params.delete("finca"); router.replace(`${pathname}?${params.toString()}`, { scroll: false }); setPage(1); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {fincaOptions.map((n) => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Semana</span>
            <Input type="number" min="1" max="53" value={weekFilter} onChange={(e) => { const next = e.target.value; setWeekFilter(next); const params = new URLSearchParams(); for (const [key, value] of (searchParams as any).entries?.() || []) { params.set(key, value); } if (next) params.set("semana", next); else params.delete("semana"); router.replace(`${pathname}?${params.toString()}`, { scroll: false }); setPage(1); }} className="w-[100px]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Año</span>
            <Select value={yearFilter} onValueChange={(v) => { const next = v; setYearFilter(next); const params = new URLSearchParams(); for (const [key, value] of (searchParams as any).entries?.() || []) { params.set(key, value); } if (next) params.set("anio", next); else params.delete("anio"); router.replace(`${pathname}?${params.toString()}`, { scroll: false }); setPage(1); }}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Desde</span>
            <Input type="date" value={startDate} onChange={(e) => { const next = e.target.value; setStartDate(next); const params = new URLSearchParams(); for (const [key, value] of (searchParams as any).entries?.() || []) { params.set(key, value); } if (next) params.set("desde", next); else params.delete("desde"); router.replace(`${pathname}?${params.toString()}`, { scroll: false }); setPage(1); }} className="w-[140px]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Hasta</span>
            <Input type="date" value={endDate} onChange={(e) => { const next = e.target.value; setEndDate(next); const params = new URLSearchParams(); for (const [key, value] of (searchParams as any).entries?.() || []) { params.set(key, value); } if (next) params.set("hasta", next); else params.delete("hasta"); router.replace(`${pathname}?${params.toString()}`, { scroll: false }); setPage(1); }} className="w-[140px]" />
          </div>
          <Button variant="ghost" onClick={() => { setWeekFilter(""); setYearFilter(""); setStartDate(""); setEndDate(""); const params = new URLSearchParams(); for (const [key, value] of (searchParams as any).entries?.() || []) { params.set(key, value); } params.delete("semana"); params.delete("anio"); params.delete("desde"); params.delete("hasta"); router.replace(`${pathname}?${params.toString()}`, { scroll: false }); setPage(1); }}>Limpiar filtros</Button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por finca o color de cinta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
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
        </div>

        {paginated.length === 0 ? (
          <div className="flex items-center justify-center rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No hay registros que coincidan con tus filtros.
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[540px] rounded-md border border-border responsive-table">
            <div key={`${fincaSel}-${weekFilter}-${yearFilter}-${startDate}-${endDate}`} className="animate-in fade-in duration-200">
              <Table className="text-sm table-auto md:table-fixed min-w-[900px] md:min-w-[1050px] lg:min-w-[1150px]">
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
                  <button className="flex items-center gap-1" onClick={() => toggleSort("año")}>Año {sortBy === "año" ? (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : null}</button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1" onClick={() => toggleSort("colorCinta")}>Color {sortBy === "colorCinta" ? (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : null}</button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1" onClick={() => toggleSort("cantidadEnfundes")}>Enfundes {sortBy === "cantidadEnfundes" ? (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : null}</button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1" onClick={() => toggleSort("matasCaidas")}>Matas Caídas {sortBy === "matasCaidas" ? (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : null}</button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1" onClick={() => toggleSort("responsable")}>Responsable {sortBy === "responsable" ? (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : null}</button>
                </TableHead>
                <TableHead className="w-[84px] text-right">Acciones</TableHead>
              </TableRow>
              </TableHeader>
              <TableBody className="animate-in fade-in duration-200">
              {paginated.map((enfunde) => {
                const fincaInfo = getFincaInfo(enfunde.finca);
                return (
                  <TableRow key={enfunde.id} className="odd:bg-muted/50 hover:bg-muted transition-colors">
                    <TableCell>
                      {new Date(enfunde.fecha).toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "numeric" })}
                    </TableCell>
                    <TableCell className="truncate max-w-[160px]">{enfunde.finca}</TableCell>
                    <TableCell className="text-right tabular-nums whitespace-nowrap">{enfunde.semana}</TableCell>
                    <TableCell className="text-right tabular-nums whitespace-nowrap">{enfunde.año}</TableCell>
                    <TableCell>
                      <Badge className={getBadgeClass(enfunde.colorCinta)}>
                        {enfunde.colorCinta}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums whitespace-nowrap">
                      {enfunde.cantidadEnfundes.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums whitespace-nowrap">
                      {enfunde.matasCaidas.toLocaleString()}
                    </TableCell>
                    <TableCell className="truncate max-w-[140px] whitespace-nowrap">
                      {fincaInfo?.responsable || "No asignado"}
                    </TableCell>
                    
                    <TableCell className="w-[84px] text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(enfunde)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setToDelete(enfunde)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="bg-muted/50">
                <TableCell className="font-semibold">TOTAL</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell className="text-right tabular-nums whitespace-nowrap">{pageTotals.enf.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums whitespace-nowrap">{pageTotals.matas.toLocaleString()}</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              </TableBody>
            </Table>
            </div>
          </div>
        )}
        <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Enfunde</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Color</span>
                <Input className="h-11" value={editForm.colorCinta} onChange={(e) => setEditForm({ ...editForm, colorCinta: e.target.value })} />
              </div>
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Enfundes</span>
                <Input className="h-11" type="number" value={editForm.cantidadEnfundes} onChange={(e) => setEditForm({ ...editForm, cantidadEnfundes: e.target.value })} />
              </div>
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Matas Caídas</span>
                <Input className="h-11" type="number" value={editForm.matasCaidas} onChange={(e) => setEditForm({ ...editForm, matasCaidas: e.target.value })} />
              </div>
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Fecha</span>
                <Input className="h-11" type="date" value={editForm.fecha} onChange={(e) => setEditForm({ ...editForm, fecha: e.target.value })} />
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-end gap-2 mt-4">
              <Button className="h-11" variant="secondary" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button className="h-11" onClick={saveEdit}>Guardar</Button>
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
                <PaginationPrevious href="#" disabled={page <= 1} onClick={(e) => { e.preventDefault(); if (page > 1) setPage((p) => Math.max(1, p - 1)); }} />
              </PaginationItem>
              {!isMobile && Array.from({ length: pageCount }).map((_, i) => (
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
