"use client";

import { KpiCard } from "@/src/components/shared/kpi-card";
import { TrendChart } from "@/src/components/dashboard/trend-chart";
import { useApp } from "@/src/contexts/app-context";
import { Package, Users, TrendingUp, AlertCircle, ArrowRight, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import Link from "next/link";

export default function DashboardPage() {
  const { cosechas, enfundes, rolesPago, alertas, insumos, currentUser } = useApp();

  const totalProduccion = cosechas.reduce((sum, c) => sum + (c.cajasProducidas || 0), 0);
  const totalEnfundes = enfundes.reduce((sum, e) => sum + (e.cantidadEnfundes || 0), 0);
  const nominaPendiente = rolesPago.filter(r => r.estado === 'pendiente').reduce((sum, r) => sum + (r.netoAPagar || 0), 0);
  const alertasActivas = alertas.filter((a) => !a.leida);
  const insumosStockBajo = insumos.filter((i) => i.stockActual < i.stockMinimo);

  // Obtener semana actual
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Bienvenido, {currentUser?.nombre?.split(' ')[0] || 'Usuario'}
        </h1>
        <p className="text-muted-foreground">
          Semana {weekNumber}, {now.getFullYear()} • Resumen operacional
        </p>
      </div>

      {/* KPIs principales - Solo 4 métricas clave */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Producción Semanal"
          value={`${totalProduccion.toLocaleString()} cajas`}
          change={5.2}
          trend="up"
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <KpiCard
          label="Enfundes"
          value={totalEnfundes.toLocaleString()}
          change={-2.1}
          trend="down"
          icon={<Package className="h-6 w-6" />}
        />
        <KpiCard
          label="Nómina Pendiente"
          value={`$${nominaPendiente.toLocaleString("en-US", { minimumFractionDigits: 0 })}`}
          icon={<Users className="h-6 w-6" />}
        />
        <KpiCard
          label="Alertas"
          value={alertasActivas.length}
          icon={<AlertCircle className="h-6 w-6" />}
        />
      </div>

      {/* Contenido principal: Alertas + Gráfica */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Alertas críticas - Columna izquierda */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Alertas Activas
              </span>
              <Badge variant={alertasActivas.length > 0 ? "destructive" : "secondary"}>
                {alertasActivas.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alertasActivas.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                ✓ Sin alertas pendientes
              </p>
            ) : (
              <>
                {alertasActivas.slice(0, 4).map((alerta) => (
                  <div
                    key={alerta.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      alerta.tipo === 'critico' || alerta.prioridad === 'alta'
                        ? 'border-l-red-500 bg-red-50 dark:bg-red-950/20'
                        : alerta.tipo === 'advertencia' || alerta.prioridad === 'media'
                        ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
                        : 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20'
                    }`}
                  >
                    <p className="font-medium text-sm">{alerta.titulo}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {alerta.mensaje || alerta.descripcion}
                    </p>
                  </div>
                ))}
                {alertasActivas.length > 4 && (
                  <Link href="/inventario/alertas">
                    <Button variant="ghost" size="sm" className="w-full">
                      Ver todas ({alertasActivas.length})
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </>
            )}
            
            {/* Stock bajo */}
            {insumosStockBajo.length > 0 && (
              <div className="pt-3 border-t">
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  ⚠️ {insumosStockBajo.length} insumos con stock bajo
                </p>
                <Link href="/inventario/insumos">
                  <Button variant="link" size="sm" className="p-0 h-auto">
                    Ver inventario →
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfica de tendencia - Columna derecha */}
        <div className="lg:col-span-2">
          <TrendChart />
        </div>
      </div>

      {/* Acciones rápidas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/produccion/enfundes?action=new">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Package className="h-5 w-5" />
                <span className="text-xs">Registrar Enfunde</span>
              </Button>
            </Link>
            <Link href="/produccion/cosechas?action=new">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <TrendingUp className="h-5 w-5" />
                <span className="text-xs">Registrar Cosecha</span>
              </Button>
            </Link>
            <Link href="/inventario/movimientos?action=new">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Package className="h-5 w-5" />
                <span className="text-xs">Mov. Inventario</span>
              </Button>
            </Link>
            <Link href="/reportes">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <AlertCircle className="h-5 w-5" />
                <span className="text-xs">Ver Reportes</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
