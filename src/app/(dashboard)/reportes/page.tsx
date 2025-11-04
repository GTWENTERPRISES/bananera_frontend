import { AIInsights } from "@/src/components/reportes/ai-insights";
import { ReporteGenerator } from "@/src/components/reportes/reporte-generator";
import { AnalyticsCharts } from "@/src/components/reportes/analytics-charts";
import { ComparativaFincas } from "@/src/components/reportes/comparativa-fincas";
import { KPISummary } from "@/src/components/reportes/kpi-summary";

export default function ReportesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Reportes y Analytics
        </h1>
        <p className="text-muted-foreground">
          Análisis inteligente con insights generados por IA
        </p>
      </div>

      <KPISummary />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AIInsights />
        </div>
        <ReporteGenerator />
      </div>

      <AnalyticsCharts />

      <ComparativaFincas />
    </div>
  );
}
