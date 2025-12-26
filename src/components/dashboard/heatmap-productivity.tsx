"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";
import { useApp } from "@/src/contexts/app-context";
import { useMemo, useState } from "react";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function HeatmapProductivity() {
  const { cosechas, fincas: fincasData, enfundes } = useApp();
  const fincas = useMemo(() => fincasData.map((f) => f.nombre), [fincasData]);
  const lotes = ["A", "B", "C", "D", "E"];
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const years = useMemo(() => {
    const set = new Set<number>();
    for (const c of cosechas) set.add(c.año);
    return Array.from(set).sort((a, b) => a - b);
  }, [cosechas]);

  const [weekFilter, setWeekFilter] = useState<string>(searchParams.get("semana") || "");
  const [yearFilter, setYearFilter] = useState<string>(searchParams.get("anio") || "");
  const [fincaFilter, setFincaFilter] = useState<string>(searchParams.get("finca") || "");
  const [targetPerLote, setTargetPerLote] = useState<number>(() => {
    const m = Number(searchParams.get("meta") || "");
    return Number.isFinite(m) && m > 0 ? m : 600;
  });
  const [showMetas, setShowMetas] = useState(false);
  const [metaByFinca, setMetaByFinca] = useState<Record<string, number>>(() => {
    const def: Record<string, number> = {};
    const base: Record<string, number> = {
      BABY: 650,
      SOLO: 550,
      LAURITA: 600,
      MARAVILLA: 700,
    };
    for (const f of fincas) def[f] = base[f] ?? 600;
    const s = searchParams.get("metas") || "";
    if (s) {
      for (const pair of s.split(",")) {
        const [name, val] = pair.split(":");
        const n = Number(val);
        if (name && Number.isFinite(n) && n > 0 && def[name] !== undefined) def[name] = n;
      }
    }
    return def;
  });

  const filteredCosechas = useMemo(() => {
    return cosechas.filter((c) => {
      const wOk = weekFilter ? String(c.semana) === weekFilter : true;
      const yOk = yearFilter ? String(c.año) === yearFilter : true;
      const fOk = fincaFilter ? c.finca === fincaFilter : true;
      return wOk && yOk && fOk;
    });
  }, [cosechas, weekFilter, yearFilter, fincaFilter]);

  const latestCajasByFinca = useMemo(() => {
    const map = new Map<string, number>();
    const src = filteredCosechas.length > 0 ? filteredCosechas : cosechas;
    for (const c of src) {
      const prev = map.get(c.finca);
      if (!prev || c.cajasProducidas >= prev) map.set(c.finca, c.cajasProducidas);
    }
    return map;
  }, [cosechas, filteredCosechas]);

  const latestLotesByFinca = useMemo(() => {
    const map = new Map<string, { A: number; B: number; C: number; D: number; E: number }>();
    const src = filteredCosechas.length > 0 ? filteredCosechas : cosechas;
    for (const c of src) {
      if (!c.cajasPorLote) continue;
      const prev = map.get(c.finca);
      const sumPrev = prev ? prev.A + prev.B + prev.C + prev.D + prev.E : -1;
      const sumCurr = (c.cajasPorLote.A ?? 0) + (c.cajasPorLote.B ?? 0) + (c.cajasPorLote.C ?? 0) + (c.cajasPorLote.D ?? 0) + (c.cajasPorLote.E ?? 0);
      if (!prev || sumCurr >= sumPrev) {
        map.set(c.finca, {
          A: c.cajasPorLote.A ?? 0,
          B: c.cajasPorLote.B ?? 0,
          C: c.cajasPorLote.C ?? 0,
          D: c.cajasPorLote.D ?? 0,
          E: c.cajasPorLote.E ?? 0,
        });
      }
    }
    return map;
  }, [cosechas, filteredCosechas]);

  const filteredEnfundes = useMemo(() => {
    return enfundes.filter((e) => {
      const wOk = weekFilter ? e.semana === Number(weekFilter) : true;
      const yOk = yearFilter ? e.año === Number(yearFilter) : true;
      const fOk = fincaFilter ? e.finca === fincaFilter : true;
      return wOk && yOk && fOk;
    });
  }, [enfundes, weekFilter, yearFilter, fincaFilter]);

  const colorToLote = (color: string): keyof Record<string, number> => {
    const c = color.toLowerCase();
    if (c.includes("azul")) return "A";
    if (c.includes("rojo")) return "B";
    if (c.includes("verde")) return "C";
    if (c.includes("amarillo")) return "D";
    return "E";
  };

  const productivityData: Record<string, Record<string, number>> = useMemo(() => {
    const src = filteredEnfundes.length > 0 ? filteredEnfundes : enfundes;
    const enfPorFincaLote: Record<string, Record<string, number>> = {};
    for (const f of fincas) {
      enfPorFincaLote[f] = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    }
    for (const e of src) {
      const l = colorToLote(e.colorCinta);
      enfPorFincaLote[e.finca][l] += e.cantidadEnfundes;
    }
    const data: Record<string, Record<string, number>> = {};
    for (const f of fincas) {
      const metaFinca = (metaByFinca[f] ?? targetPerLote) > 0 ? (metaByFinca[f] ?? targetPerLote) : 1;
      const row: Record<string, number> = {};
      const lotesProd = latestLotesByFinca.get(f);
      if (lotesProd) {
        for (const l of lotes) {
          const prodLote = lotesProd[l as keyof typeof lotesProd] ?? 0;
          const pct = Math.max(0, Math.min(100, Math.round((prodLote / metaFinca) * 100)));
          row[l] = pct;
        }
      } else {
        const totalsEnf = enfPorFincaLote[f];
        const sumaEnf = Object.values(totalsEnf).reduce((s, n) => s + n, 0);
        const baseProd = latestCajasByFinca.get(f) ?? 0;
        for (const l of lotes) {
          const propor = sumaEnf > 0 ? totalsEnf[l] / sumaEnf : 0;
          const prodLote = Math.round(baseProd * propor);
          const pct = Math.max(0, Math.min(100, Math.round((prodLote / metaFinca) * 100)));
          row[l] = pct;
        }
      }
      data[f] = row;
    }
    return data;
  }, [fincas, lotes, enfundes, filteredEnfundes, targetPerLote, metaByFinca, latestCajasByFinca, latestLotesByFinca]);

  const totalsByFincaLote: Record<string, Record<string, number>> = useMemo(() => {
    const src = filteredEnfundes.length > 0 ? filteredEnfundes : enfundes;
    const enfPorFincaLote: Record<string, Record<string, number>> = {};
    for (const f of fincas) enfPorFincaLote[f] = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    for (const e of src) {
      const l = colorToLote(e.colorCinta);
      enfPorFincaLote[e.finca][l] += e.cantidadEnfundes;
    }
    const prodPorFincaLote: Record<string, Record<string, number>> = {};
    for (const f of fincas) {
      const lotesProd = latestLotesByFinca.get(f);
      if (lotesProd) {
        prodPorFincaLote[f] = {
          A: lotesProd.A ?? 0,
          B: lotesProd.B ?? 0,
          C: lotesProd.C ?? 0,
          D: lotesProd.D ?? 0,
          E: lotesProd.E ?? 0,
        };
      } else {
        const totalsEnf = enfPorFincaLote[f];
        const sumaEnf = Object.values(totalsEnf).reduce((s, n) => s + n, 0);
        const baseProd = latestCajasByFinca.get(f) ?? 0;
        const row: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
        for (const l of lotes) {
          const propor = sumaEnf > 0 ? totalsEnf[l] / sumaEnf : 0;
          row[l] = Math.round(baseProd * propor);
        }
        prodPorFincaLote[f] = row;
      }
    }
    return prodPorFincaLote;
  }, [fincas, enfundes, filteredEnfundes, latestCajasByFinca, lotes, latestLotesByFinca]);

  const displayFincas = useMemo(() => {
    if (fincaFilter && fincas.includes(fincaFilter)) return [fincaFilter];
    return fincas;
  }, [fincas, fincaFilter]);

  const getColorClass = (value: number) => {
    if (value === 0) return "bg-gray-300";
    if (value >= 75) return "bg-green-600";
    if (value >= 50) return "bg-green-500";
    if (value >= 25) return "bg-yellow-500";
    if (value >= 10) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapa de Calor - Productividad por Lotes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Finca</span>
              <Select
                value={fincaFilter}
                onValueChange={(v) => {
                  const next = v === "todas" ? "" : v;
                  setFincaFilter(next);
                  const params = new URLSearchParams();
                  for (const [key, value] of (searchParams as any).entries?.() || []) {
                    params.set(key, value);
                  }
                  if (next) params.set("finca", next);
                  else params.delete("finca");
                  router.replace(`${pathname}?${params.toString()}`, { scroll: false });
                }}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {fincas.map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Semana</span>
              <Input
                type="number"
                min="1"
                max="53"
                className="w-[100px]"
                value={weekFilter}
                onChange={(e) => {
                  const next = e.target.value;
                  setWeekFilter(next);
                  const params = new URLSearchParams();
                  for (const [key, value] of (searchParams as any).entries?.() || []) {
                    params.set(key, value);
                  }
                  if (next) params.set("semana", next);
                  else params.delete("semana");
                  router.replace(`${pathname}?${params.toString()}`, { scroll: false });
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Año</span>
              <Select value={yearFilter} onValueChange={(v) => {
                const next = v === "todos" ? "" : v;
                setYearFilter(next);
                const params = new URLSearchParams();
                for (const [key, value] of (searchParams as any).entries?.() || []) {
                  params.set(key, value);
                }
                if (next) params.set("anio", next);
                else params.delete("anio");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });
              }}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Meta por lote</span>
              <Input
                type="number"
                min="1"
                className="w-[120px]"
                value={String(targetPerLote)}
                onChange={(e) => {
                  const nextNum = Number(e.target.value);
                  const next = Number.isFinite(nextNum) && nextNum > 0 ? nextNum : 1;
                  setTargetPerLote(next);
                  const params = new URLSearchParams();
                  for (const [key, value] of (searchParams as any).entries?.() || []) {
                    params.set(key, value);
                  }
                  params.set("meta", String(next));
                  router.replace(`${pathname}?${params.toString()}`, { scroll: false });
                }}
              />
            </div>
            <Button variant="outline" onClick={() => setShowMetas((v) => !v)}>Metas por finca</Button>
            <Button
              variant="ghost"
              onClick={() => {
                setWeekFilter("");
                setYearFilter("");
                setFincaFilter("");
                setTargetPerLote(600);
                const reset: Record<string, number> = {};
                for (const f of fincas) reset[f] = 600;
                setMetaByFinca(reset);
                const params = new URLSearchParams();
                for (const [key, value] of (searchParams as any).entries?.() || []) {
                  params.set(key, value);
                }
                params.delete("semana");
                params.delete("anio");
                params.delete("finca");
                params.delete("meta");
                params.delete("metas");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });
              }}
            >
              Limpiar filtros
            </Button>
          </div>
          {showMetas && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {fincas.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{f}</span>
                  <Input
                    type="number"
                    min="1"
                    className="w-[120px]"
                    value={String(metaByFinca[f] ?? 600)}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      const val = Number.isFinite(n) && n > 0 ? n : 1;
                      const next = { ...metaByFinca, [f]: val };
                      setMetaByFinca(next);
                      const encoded = fincas.map((name) => `${name}:${next[name] ?? 600}`).join(",");
                      const params = new URLSearchParams();
                      for (const [key, value] of (searchParams as any).entries?.() || []) {
                        params.set(key, value);
                      }
                      params.set("metas", encoded);
                      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
                    }}
                  />
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-6 gap-2">
            <div className="text-xs font-medium text-muted-foreground"></div>
            {lotes.map((lote) => (
              <div
                key={lote}
                className="text-center text-xs font-medium text-muted-foreground"
              >
                Lote {lote}
              </div>
            ))}
          </div>

          {displayFincas.map((finca) => (
            <div key={finca} className="grid grid-cols-6 gap-2">
              <div className="flex items-center text-xs font-medium text-foreground">
                {finca}
              </div>
              {lotes.map((lote) => {
                const display = productivityData[finca][lote];
                const meta = (metaByFinca[finca] ?? targetPerLote) > 0 ? (metaByFinca[finca] ?? targetPerLote) : 1;
                const total = totalsByFincaLote[finca][lote];
                return (
                  <div
                    key={`${finca}-${lote}`}
                    className={cn(
                      "flex h-12 items-center justify-center rounded text-xs font-bold text-white",
                      getColorClass(display)
                    )}
                    title={`${total.toLocaleString()} / ${meta.toLocaleString()} → ${display}%`}
                  >
                    {`${display}%`}
                  </div>
                );
              })}
            </div>
          ))}

          <div className="flex items-center justify-center gap-4 pt-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-gray-300"></div>
              <span className="text-xs text-muted-foreground">0%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-red-500"></div>
              <span className="text-xs text-muted-foreground">1-10%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-orange-500"></div>
              <span className="text-xs text-muted-foreground">10-25%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-yellow-500"></div>
              <span className="text-xs text-muted-foreground">25-50%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-green-500"></div>
              <span className="text-xs text-muted-foreground">50-75%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-green-600"></div>
              <span className="text-xs text-muted-foreground">&gt;75%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
