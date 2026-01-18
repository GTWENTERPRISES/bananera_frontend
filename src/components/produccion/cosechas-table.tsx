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
import { cn } from "@/src/lib/utils";
import { useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Edit, Search, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/src/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { toast } from "sonner";

export function CosechasTable() {
  const { getFilteredCosechas, fincas, updateCosecha, deleteCosecha } = useApp();
  const cosechas = getFilteredCosechas();
  const [searchTerm, setSearchTerm] = useState("");
  const searchParams = useSearchParams();
  const fincaFilter = searchParams.get("finca") || "";
  const [fincaSel, setFincaSel] = useState(fincaFilter);
  const router = useRouter();
  const pathname = usePathname();
  const [weekFilter, setWeekFilter] = useState(
    searchParams.get("semana") || ""
  );
  const [yearFilter, setYearFilter] = useState(searchParams.get("anio") || "");
  const [sortBy, setSortBy] = useState<
    | "fecha"
    | "semana"
    | "año"
    | "finca"
    | "racimosCorta"
    | "racimosRechazados"
    | "racimosRecuperados"
    | "cajasProducidas"
    | "pesoPromedio"
    | "calibracion"
    | "numeroManos"
    | "ratio"
    | "merma"
    | "responsable"
  >("fecha");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const latestRecord = useMemo(() => {
    let best: (typeof cosechas)[number] | null = null;
    for (const c of cosechas) {
      if (!best) best = c;
      else if (
        c.año > best.año ||
        (c.año === best.año && c.semana > best.semana)
      )
        best = c;
    }
    return best;
  }, [cosechas]);

  const years = useMemo(() => {
    return Array.from(new Set(cosechas.map((c) => c.año))).sort(
      (a, b) => a - b
    );
  }, [cosechas]);

  const fincaOptions = useMemo(() => {
    return Array.from(new Set(fincas.map((f) => f.nombre)));
  }, [fincas]);

  // Función para obtener información de la finca
  const getFincaInfo = (fincaName: string) => {
    return fincas.find((f) => f.nombre === fincaName);
  };
  const getDateFromYearSemana = (year: number, week: number) => {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dayOfWeek = simple.getDay();
    const ISOweekStart = new Date(simple);
    if (dayOfWeek <= 4)
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
  };

  const filteredCosechas = useMemo(() => {
    return cosechas.filter((cosecha) => {
      const fincaName = cosecha.fincaNombre || cosecha.finca;
      const matchesSearch =
        fincaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (
          getFincaInfo(fincaName)?.responsable?.toLowerCase() || ""
        ).includes(searchTerm.toLowerCase());
      const matchesFinca = fincaSel ? fincaName === fincaSel : true;
      const matchesWeek = weekFilter
        ? cosecha.semana === Number(weekFilter)
        : true;
      const matchesYear = yearFilter
        ? cosecha.año === Number(yearFilter)
        : true;
      return matchesSearch && matchesFinca && matchesWeek && matchesYear;
    });
  }, [cosechas, searchTerm, fincaSel, weekFilter, yearFilter]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    const v = searchParams.get("pageSize");
    const n = v ? Number(v) : 10;
    return [10, 20, 50].includes(n) ? n : 10;
  });
  const total = filteredCosechas.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = (page - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const sortedCosechas = useMemo(() => {
    const getValue = (c: (typeof cosechas)[number]) => {
      if (sortBy === "fecha")
        return (
          c.fecha ? new Date(c.fecha) : getDateFromYearSemana(c.año, c.semana)
        ).getTime();
      if (sortBy === "semana") return c.semana;
      if (sortBy === "año") return c.año;
      if (sortBy === "finca") return (c.fincaNombre || c.finca).toLowerCase();
      if (sortBy === "racimosCorta") return c.racimosCorta;
      if (sortBy === "racimosRechazados") return c.racimosRechazados;
      if (sortBy === "racimosRecuperados") return c.racimosRecuperados;
      if (sortBy === "cajasProducidas") return c.cajasProducidas;
      if (sortBy === "pesoPromedio") return c.pesoPromedio;
      if (sortBy === "calibracion") return String(c.calibracion).toLowerCase();
      if (sortBy === "numeroManos") return c.numeroManos;
      if (sortBy === "ratio") return c.ratio;
      if (sortBy === "merma") return c.merma;
      if (sortBy === "responsable")
        return (getFincaInfo(c.fincaNombre || c.finca)?.responsable || "").toLowerCase();
      return 0;
    };
    const arr = [...filteredCosechas];
    arr.sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      let cmp = 0;
      if (typeof va === "number" && typeof vb === "number") cmp = va - vb;
      else cmp = String(va).localeCompare(String(vb));
      if (sortBy === "año" && cmp === 0) {
        cmp = a.semana - b.semana;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filteredCosechas, sortBy, sortDir]);

  const paginated = sortedCosechas.slice(startIdx, endIdx);
  const applyLatestFilters = () => {
    if (!latestRecord) return;
    const nextWeek = String(latestRecord.semana);
    const nextYear = String(latestRecord.año);
    setWeekFilter(nextWeek);
    setYearFilter(nextYear);
    const params = new URLSearchParams();
    for (const [key, value] of (searchParams as any).entries?.() || [])
      params.set(key, value);
    params.set("semana", nextWeek);
    params.set("anio", nextYear);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setPage(1);
  };

  const toggleSort = (key: typeof sortBy) => {
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(key);
      setSortDir(key === "año" || key === "fecha" ? "desc" : "asc");
    }
    setPage(1);
  };

  const totalCajas = filteredCosechas.reduce(
    (sum, c) => sum + c.cajasProducidas,
    0
  );
  const avgRatio =
    filteredCosechas.length > 0
      ? filteredCosechas.reduce((sum, c) => sum + c.ratio, 0) /
        filteredCosechas.length
      : 0;
  const avgMerma =
    filteredCosechas.length > 0
      ? filteredCosechas.reduce((sum, c) => sum + c.merma, 0) /
        filteredCosechas.length
      : 0;

  const pageTotals = useMemo(() => {
    const arr = paginated;
    const totals = {
      racimosCorta: 0,
      racimosRechazados: 0,
      racimosRecuperados: 0,
      cajasProducidas: 0,
      pesoPromedio: 0,
      calibracion: 0,
      numeroManos: 0,
      ratio: 0,
      merma: 0,
      count: arr.length,
    };
    for (const c of arr) {
      totals.racimosCorta += c.racimosCorta;
      totals.racimosRechazados += c.racimosRechazados;
      totals.racimosRecuperados += c.racimosRecuperados;
      totals.cajasProducidas += c.cajasProducidas;
      totals.pesoPromedio += c.pesoPromedio;
      totals.calibracion += c.calibracion;
      totals.numeroManos += c.numeroManos;
      totals.ratio += c.ratio;
      totals.merma += c.merma;
    }
    const avg = (v: number) => (totals.count ? v / totals.count : 0);
    return {
      racimosCorta: totals.racimosCorta,
      racimosRechazados: totals.racimosRechazados,
      racimosRecuperados: totals.racimosRecuperados,
      cajasProducidas: totals.cajasProducidas,
      pesoPromedio: avg(totals.pesoPromedio),
      calibracion: avg(totals.calibracion),
      numeroManos: avg(totals.numeroManos),
      ratio: avg(totals.ratio),
      merma: avg(totals.merma),
    };
  }, [paginated]);

  const getMermaColor = (merma: number) => {
    if (merma < 3) return "text-green-600";
    if (merma < 4) return "text-yellow-600";
    return "text-red-600";
  };

  const [editing, setEditing] = useState<null | (typeof cosechas)[number]>(
    null
  );
  const [editForm, setEditForm] = useState({
    racimosCorta: "",
    racimosRechazados: "",
    cajasProducidas: "",
    pesoPromedio: "",
    calibracion: "",
    numeroManos: "",
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editTouched, setEditTouched] = useState<Record<string, boolean>>({});
  const [toDelete, setToDelete] = useState<null | (typeof cosechas)[number]>(
    null
  );

  // Validación en vivo para edición
  const validateEditField = (field: string, value: string): string => {
    if (!value) return "Campo requerido";
    const num = Number(value);
    if (isNaN(num)) return "Debe ser un número";
    if (num < 0) return "Debe ser >= 0";
    return "";
  };

  const handleEditChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
    const error = validateEditField(field, value);
    setEditErrors(prev => ({ ...prev, [field]: error }));
    setEditTouched(prev => ({ ...prev, [field]: true }));
  };

  const openEdit = (c: (typeof cosechas)[number]) => {
    setEditing(c);
    setEditForm({
      racimosCorta: String(c.racimosCorta),
      racimosRechazados: String(c.racimosRechazados),
      cajasProducidas: String(c.cajasProducidas),
      pesoPromedio: String(c.pesoPromedio),
      calibracion: String(c.calibracion),
      numeroManos: String(c.numeroManos),
    });
    setEditErrors({});
    setEditTouched({});
  };

  const isEditFormValid = () => {
    return Object.values(editForm).every(v => v && Number(v) >= 0) &&
           !Object.values(editErrors).some(e => e);
  };

  const saveEdit = () => {
    if (!editing || !isEditFormValid()) return;
    const racimosCorta = Number.parseInt(editForm.racimosCorta || "0");
    const racimosRechazados = Number.parseInt(
      editForm.racimosRechazados || "0"
    );
    const racimosRecuperados = Math.max(0, racimosCorta - racimosRechazados);
    const cajasProducidas = Number.parseInt(editForm.cajasProducidas || "0");
    const pesoPromedio = Number.parseFloat(editForm.pesoPromedio || "0");
    const calibracion = Number.parseFloat(editForm.calibracion || "0");
    const numeroManos = Number.parseFloat(editForm.numeroManos || "0");
    const ratio =
      racimosRecuperados > 0 ? Math.round((cajasProducidas / racimosRecuperados) * 100) / 100 : 0;
    const merma =
      racimosCorta > 0 ? Math.round((racimosRechazados / racimosCorta) * 10000) / 100 : 0;
    updateCosecha(editing.id, {
      racimosCorta,
      racimosRechazados,
      racimosRecuperados,
      cajasProducidas,
      pesoPromedio,
      calibracion,
      numeroManos,
      ratio,
      merma,
    });
    toast.success("Cosecha actualizada");
    setEditing(null);
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    deleteCosecha(toDelete.id);
    toast.success("Cosecha eliminada");
    setToDelete(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Registro de Cosechas</CardTitle>
        <ExportButton
          data={filteredCosechas}
          headers={[
            "Semana",
            "Año",
            "Finca",
            "Racimos Cortados",
            "Racimos Rechazados",
            "Racimos Recuperados",
            "Cajas Producidas",
            "Peso Promedio",
            "Calibración",
            "Número de Manos",
            "Ratio",
            "Merma",
          ]}
          keys={[
            "semana",
            "año",
            "finca",
            "racimosCorta",
            "racimosRechazados",
            "racimosRecuperados",
            "cajasProducidas",
            "pesoPromedio",
            "calibracion",
            "numeroManos",
            "ratio",
            "merma",
          ]}
          title="Registro de Cosechas"
          filename="registro-cosechas"
          enableFilter
          weekField="semana"
          yearField="año"
        />
      </CardHeader>
      <CardContent>
        {latestRecord && (
          <div className="mb-4 rounded-lg border border-border bg-muted/40 p-3 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Último registro:{" "}
              <span className="font-medium text-foreground">
                {latestRecord.fincaNombre || latestRecord.finca}
              </span>{" "}
              · S{latestRecord.semana} · {latestRecord.año} · Cajas{" "}
              {latestRecord.cajasProducidas.toLocaleString()}
            </div>
            <Button variant="outline" size="sm" onClick={applyLatestFilters}>
              Ver
            </Button>
          </div>
        )}
        <div className="mb-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Total Cajas</p>
            <p className="text-2xl font-bold text-foreground">
              {totalCajas.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Ratio Promedio</p>
            <p className="text-2xl font-bold text-foreground">
              {avgRatio.toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Merma Promedio</p>
            <p className={cn("text-2xl font-bold", getMermaColor(avgMerma))}>
              {avgMerma.toFixed(2)}%
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Semana</span>
            <Input
              type="number"
              min="1"
              max="53"
              value={weekFilter}
              onChange={(e) => {
                const next = e.target.value;
                setWeekFilter(next);
                const params = new URLSearchParams();
                for (const [key, value] of (searchParams as any).entries?.() ||
                  []) {
                  params.set(key, value);
                }
                if (next) params.set("semana", next);
                else params.delete("semana");
                router.replace(`${pathname}?${params.toString()}`, {
                  scroll: false,
                });
                setPage(1);
              }}
              className="w-[100px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Año</span>
            <Select
              value={yearFilter}
              onValueChange={(v) => {
                const next = v;
                setYearFilter(next);
                const params = new URLSearchParams();
                for (const [key, value] of (searchParams as any).entries?.() ||
                  []) {
                  params.set(key, value);
                }
                if (next) params.set("anio", next);
                else params.delete("anio");
                router.replace(`${pathname}?${params.toString()}`, {
                  scroll: false,
                });
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              setWeekFilter("");
              setYearFilter("");
              const params = new URLSearchParams();
              for (const [key, value] of (searchParams as any).entries?.() ||
                []) {
                params.set(key, value);
              }
              params.delete("semana");
              params.delete("anio");
              router.replace(`${pathname}?${params.toString()}`, {
                scroll: false,
              });
              setPage(1);
            }}
          >
            Limpiar filtros
          </Button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Finca</span>
            <Select
              value={fincaSel}
              onValueChange={(v) => {
                const next = v === "todas" ? "" : v;
                setFincaSel(next);
                const params = new URLSearchParams();
                for (const [key, value] of (searchParams as any).entries?.() ||
                  []) {
                  params.set(key, value);
                }
                if (next) params.set("finca", next);
                else params.delete("finca");
                router.replace(`${pathname}?${params.toString()}`, {
                  scroll: false,
                });
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {fincaOptions.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por finca o responsable..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ver</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                const next = Number(v);
                setPageSize(next);
                const params = new URLSearchParams();
                for (const [key, value] of (searchParams as any).entries?.() ||
                  []) {
                  params.set(key, value);
                }
                params.set("pageSize", String(next));
                router.replace(`${pathname}?${params.toString()}`, {
                  scroll: false,
                });
                setPage(1);
              }}
            >
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
            No hay registros de cosechas para los filtros actuales.
          </div>
        ) : (
          <div
            key={`${fincaSel}-${weekFilter}-${yearFilter}`}
            className="overflow-x-auto overflow-y-auto max-h-[540px] animate-in fade-in duration-200 rounded-md border border-border responsive-table"
          >
            <Table className="text-sm table-auto md:table-fixed min-w-[1000px] md:min-w-[1100px] lg:min-w-[1200px]">
              <TableHeader className="sticky top-0 z-10 bg-background shadow-sm text-xs md:text-sm">
              <TableRow>
                <TableHead>
                  <button
                    className="flex items-center gap-1"
                    onClick={() => toggleSort("fecha")}
                  >
                    Fecha{" "}
                    {sortBy === "fecha" ? (
                      sortDir === "asc" ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )
                    ) : null}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center gap-1"
                    onClick={() => toggleSort("semana")}
                  >
                    Semana{" "}
                    {sortBy === "semana" ? (
                      sortDir === "asc" ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )
                    ) : null}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center gap-1"
                    onClick={() => toggleSort("año")}
                  >
                    Año{" "}
                    {sortBy === "año" ? (
                      sortDir === "asc" ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )
                    ) : null}
                  </button>
                </TableHead>
                <TableHead>Finca</TableHead>
                <TableHead>
                  <button
                    className="flex items-center gap-1"
                    onClick={() => toggleSort("racimosCorta")}
                  >
                    Racimos Cortados{" "}
                    {sortBy === "racimosCorta" ? (
                      sortDir === "asc" ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )
                    ) : null}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center gap-1"
                    onClick={() => toggleSort("racimosRechazados")}
                  >
                    Racimos Rechazados{" "}
                    {sortBy === "racimosRechazados" ? (
                      sortDir === "asc" ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )
                    ) : null}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center gap-1"
                    onClick={() => toggleSort("racimosRecuperados")}
                  >
                    Racimos Recuperados{" "}
                    {sortBy === "racimosRecuperados" ? (
                      sortDir === "asc" ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )
                    ) : null}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center gap-1"
                    onClick={() => toggleSort("cajasProducidas")}
                  >
                    Cajas{" "}
                    {sortBy === "cajasProducidas" ? (
                      sortDir === "asc" ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )
                    ) : null}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center gap-1"
                    onClick={() => toggleSort("pesoPromedio")}
                  >
                    Peso Prom.{" "}
                    {sortBy === "pesoPromedio" ? (
                      sortDir === "asc" ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )
                    ) : null}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center gap-1"
                    onClick={() => toggleSort("calibracion")}
                  >
                    Calib.{" "}
                    {sortBy === "calibracion" ? (
                      sortDir === "asc" ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )
                    ) : null}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center gap-1"
                    onClick={() => toggleSort("numeroManos")}
                  >
                    Manos{" "}
                    {sortBy === "numeroManos" ? (
                      sortDir === "asc" ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )
                    ) : null}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center gap-1"
                    onClick={() => toggleSort("ratio")}
                  >
                    Ratio{" "}
                    {sortBy === "ratio" ? (
                      sortDir === "asc" ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )
                    ) : null}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center gap-1"
                    onClick={() => toggleSort("merma")}
                  >
                    Merma{" "}
                    {sortBy === "merma" ? (
                      sortDir === "asc" ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )
                    ) : null}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center gap-1"
                    onClick={() => toggleSort("responsable")}
                  >
                    Responsable{" "}
                    {sortBy === "responsable" ? (
                      sortDir === "asc" ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )
                    ) : null}
                  </button>
                </TableHead>
                <TableHead className="w-[84px] text-right">Acciones</TableHead>
              </TableRow>
              </TableHeader>
              <TableBody className="animate-in fade-in duration-200">
              {paginated.map((cosecha) => {
                const fincaName = cosecha.fincaNombre || cosecha.finca;
                const fincaInfo = getFincaInfo(fincaName);
                return (
                  <TableRow key={cosecha.id} className="odd:bg-muted/50 hover:bg-muted transition-colors">
                    <TableCell>
                      {(cosecha.fecha
                        ? new Date(cosecha.fecha)
                        : getDateFromYearSemana(cosecha.año, cosecha.semana)
                      ).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right tabular-nums whitespace-nowrap">{cosecha.semana}</TableCell>
                    <TableCell className="text-right tabular-nums whitespace-nowrap">{cosecha.año}</TableCell>
                    <TableCell className="truncate max-w-[160px]">{fincaName}</TableCell>
                    <TableCell className="text-right tabular-nums whitespace-nowrap">
                      {cosecha.racimosCorta.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums whitespace-nowrap">
                      {cosecha.racimosRechazados.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums whitespace-nowrap">
                      {cosecha.racimosRecuperados.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums whitespace-nowrap">
                      {cosecha.cajasProducidas.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums whitespace-nowrap">{cosecha.pesoPromedio.toFixed(1)} lb</TableCell>
                    <TableCell className="text-right tabular-nums whitespace-nowrap">{cosecha.calibracion}</TableCell>
                    <TableCell className="text-right tabular-nums whitespace-nowrap">{cosecha.numeroManos.toFixed(1)}</TableCell>
                    <TableCell className="text-right tabular-nums whitespace-nowrap">{cosecha.ratio.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={getMermaColor(cosecha.merma)}>
                        {cosecha.merma.toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell className="truncate max-w-[140px] whitespace-nowrap">
                      {fincaInfo?.responsable || "No asignado"}
                    </TableCell>
                    <TableCell className="w-[84px] text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(cosecha)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setToDelete(cosecha)}
                        >
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
                <TableCell className="text-right tabular-nums whitespace-nowrap">
                  {pageTotals.racimosCorta.toLocaleString()}
                </TableCell>
                <TableCell className="text-right tabular-nums whitespace-nowrap">
                  {pageTotals.racimosRechazados.toLocaleString()}
                </TableCell>
                <TableCell className="text-right tabular-nums whitespace-nowrap">
                  {pageTotals.racimosRecuperados.toLocaleString()}
                </TableCell>
                <TableCell className="text-right tabular-nums whitespace-nowrap">
                  {pageTotals.cajasProducidas.toLocaleString()}
                </TableCell>
                <TableCell className="text-right tabular-nums whitespace-nowrap">{pageTotals.pesoPromedio.toFixed(1)} lb</TableCell>
                <TableCell className="text-right tabular-nums whitespace-nowrap">{pageTotals.calibracion.toFixed(0)}</TableCell>
                <TableCell className="text-right tabular-nums whitespace-nowrap">{pageTotals.numeroManos.toFixed(1)}</TableCell>
                <TableCell className="text-right tabular-nums whitespace-nowrap">{pageTotals.ratio.toFixed(2)}</TableCell>
                <TableCell>
                  <span className="font-medium">
                    {pageTotals.merma.toFixed(2)}%
                  </span>
                </TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
        <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Cosecha</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <span className="text-sm font-medium">Racimos Cortados *</span>
                <p className="text-xs text-muted-foreground">Total cortados en la semana</p>
                <Input
                  className={`h-11 ${editErrors.racimosCorta && editTouched.racimosCorta ? 'border-red-500' : editTouched.racimosCorta && !editErrors.racimosCorta ? 'border-green-500' : ''}`}
                  type="number"
                  min="0"
                  value={editForm.racimosCorta}
                  onChange={(e) => handleEditChange("racimosCorta", e.target.value)}
                />
                {editErrors.racimosCorta && editTouched.racimosCorta && <p className="text-xs text-red-500">{editErrors.racimosCorta}</p>}
                {!editErrors.racimosCorta && editTouched.racimosCorta && editForm.racimosCorta && <p className="text-xs text-green-500">✓ Válido</p>}
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium">Racimos Rechazados *</span>
                <p className="text-xs text-muted-foreground">No cumplieron estándar</p>
                <Input
                  className={`h-11 ${editErrors.racimosRechazados && editTouched.racimosRechazados ? 'border-red-500' : editTouched.racimosRechazados && !editErrors.racimosRechazados ? 'border-green-500' : ''}`}
                  type="number"
                  min="0"
                  value={editForm.racimosRechazados}
                  onChange={(e) => handleEditChange("racimosRechazados", e.target.value)}
                />
                {editErrors.racimosRechazados && editTouched.racimosRechazados && <p className="text-xs text-red-500">{editErrors.racimosRechazados}</p>}
                {!editErrors.racimosRechazados && editTouched.racimosRechazados && editForm.racimosRechazados && <p className="text-xs text-green-500">✓ Válido</p>}
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium">Cajas Producidas *</span>
                <p className="text-xs text-muted-foreground">Total empacadas y listas</p>
                <Input
                  className={`h-11 ${editErrors.cajasProducidas && editTouched.cajasProducidas ? 'border-red-500' : editTouched.cajasProducidas && !editErrors.cajasProducidas ? 'border-green-500' : ''}`}
                  type="number"
                  min="0"
                  value={editForm.cajasProducidas}
                  onChange={(e) => handleEditChange("cajasProducidas", e.target.value)}
                />
                {editErrors.cajasProducidas && editTouched.cajasProducidas && <p className="text-xs text-red-500">{editErrors.cajasProducidas}</p>}
                {!editErrors.cajasProducidas && editTouched.cajasProducidas && editForm.cajasProducidas && <p className="text-xs text-green-500">✓ Válido</p>}
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium">Peso Promedio (lb) *</span>
                <p className="text-xs text-muted-foreground">Peso promedio por caja</p>
                <Input
                  className={`h-11 ${editErrors.pesoPromedio && editTouched.pesoPromedio ? 'border-red-500' : editTouched.pesoPromedio && !editErrors.pesoPromedio ? 'border-green-500' : ''}`}
                  type="number"
                  step="0.1"
                  min="0"
                  value={editForm.pesoPromedio}
                  onChange={(e) => handleEditChange("pesoPromedio", e.target.value)}
                />
                {editErrors.pesoPromedio && editTouched.pesoPromedio && <p className="text-xs text-red-500">{editErrors.pesoPromedio}</p>}
                {!editErrors.pesoPromedio && editTouched.pesoPromedio && editForm.pesoPromedio && <p className="text-xs text-green-500">✓ Válido</p>}
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium">Calibración *</span>
                <p className="text-xs text-muted-foreground">Grosor en 32avos de pulgada</p>
                <Input
                  className={`h-11 ${editErrors.calibracion && editTouched.calibracion ? 'border-red-500' : editTouched.calibracion && !editErrors.calibracion ? 'border-green-500' : ''}`}
                  type="number"
                  min="0"
                  value={editForm.calibracion}
                  onChange={(e) => handleEditChange("calibracion", e.target.value)}
                />
                {editErrors.calibracion && editTouched.calibracion && <p className="text-xs text-red-500">{editErrors.calibracion}</p>}
                {!editErrors.calibracion && editTouched.calibracion && editForm.calibracion && <p className="text-xs text-green-500">✓ Válido</p>}
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium">Número de Manos *</span>
                <p className="text-xs text-muted-foreground">Promedio por racimo</p>
                <Input
                  className={`h-11 ${editErrors.numeroManos && editTouched.numeroManos ? 'border-red-500' : editTouched.numeroManos && !editErrors.numeroManos ? 'border-green-500' : ''}`}
                  type="number"
                  step="0.1"
                  min="0"
                  value={editForm.numeroManos}
                  onChange={(e) => handleEditChange("numeroManos", e.target.value)}
                />
                {editErrors.numeroManos && editTouched.numeroManos && <p className="text-xs text-red-500">{editErrors.numeroManos}</p>}
                {!editErrors.numeroManos && editTouched.numeroManos && editForm.numeroManos && <p className="text-xs text-green-500">✓ Válido</p>}
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-end gap-2 mt-4">
              <Button className="h-11" variant="secondary" onClick={() => setEditing(null)}>
                Cancelar
              </Button>
              <Button className="h-11" onClick={saveEdit} disabled={!isEditFormValid()}>Guardar</Button>
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
              <AlertDialogAction onClick={confirmDelete}>
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {total === 0 ? 0 : startIdx + 1}-{endIdx} de {total}
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  size="default"
                  disabled={page <= 1}
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) setPage((p) => Math.max(1, p - 1));
                  }}
                />
              </PaginationItem>
              {Array.from({ length: pageCount }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    isActive={page === i + 1}
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(i + 1);
                    }}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  size="default"
                  disabled={page >= pageCount}
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < pageCount)
                      setPage((p) => Math.min(pageCount, p + 1));
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
}
