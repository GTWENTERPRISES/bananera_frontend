"use client";

import { KpiCard } from "@/src/components/shared/kpi-card";
import { ProductionChart } from "@/src/components/dashboard/production-chart";
import { QualityMetrics } from "@/src/components/dashboard/quality-metrics";
import { TrendChart } from "@/src/components/dashboard/trend-chart";
import { HeatmapProductivity } from "@/src/components/dashboard/heatmap-productivity";
import { AIAlerts } from "@/src/components/dashboard/ai-alerts";
import { WeeklySummary } from "@/src/components/dashboard/weekly-summary";
import { useApp } from "@/src/contexts/app-context";
import { Package, Users, TrendingUp, AlertCircle } from "lucide-react";
import dynamic from "next/dynamic";
const MiniMap = dynamic(() => import("@/src/components/geo/mini-map").then(m => m.MiniMap), { ssr: false });

export default function DashboardPage() {
  const { cosechas, enfundes, rolesPago, alertas, insumos } = useApp();

  const totalProduccion = cosechas.reduce(
    (sum, c) => sum + c.cajasProducidas,
    0
  );
  const totalEnfundes = enfundes.reduce(
    (sum, e) => sum + e.cantidadEnfundes,
    0
  );
  const nominaPendiente = rolesPago.reduce((sum, r) => sum + r.netoAPagar, 0);
  const alertasActivas = alertas.filter((a) => !a.leida).length;
  const insumosStockBajo = insumos.filter(
    (i) => i.stockActual < i.stockMinimo
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen operacional de Bananera HG - Semana 1, 2025
        </p>
      </div>

      {/* KPIs en tiempo real */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Producción Semanal"
          value={`${totalProduccion.toLocaleString()} cajas`}
          change={5.2}
          trend="up"
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <KpiCard
          label="Enfundes Realizados"
          value={totalEnfundes.toLocaleString()}
          change={-2.1}
          trend="down"
          icon={<Package className="h-6 w-6" />}
        />
        <KpiCard
          label="Nómina Pendiente"
          value={`$${nominaPendiente.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}`}
          icon={<Users className="h-6 w-6" />}
        />
        <KpiCard
          label="Alertas Activas"
          value={alertasActivas}
          icon={<AlertCircle className="h-6 w-6" />}
        />
      </div>

      {/* Weekly Summary */}
      <WeeklySummary />

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ProductionChart />
        <QualityMetrics />
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TrendChart />
        <AIAlerts />
      </div>

      {/* Heatmap */}
      <HeatmapProductivity />

      {/* Mini Map Widget */}
      <div>
        <h2 className="text-xl font-semibold">Mapa de Fincas</h2>
        <p className="text-muted-foreground mb-2">Vista rápida de la ubicación y rendimiento por hectárea.</p>
        <MiniMap />
      </div>
    </div>
  );
}
