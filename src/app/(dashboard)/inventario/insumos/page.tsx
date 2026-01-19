"use client";

import { useState } from "react";
import { InsumoForm } from "@/src/components/inventario/insumo-form";
import { InsumosTable } from "@/src/components/inventario/insumos-table";
import { useApp } from "@/src/contexts/app-context";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { MapPin, AlertTriangle, Package, Calendar, Plus, X } from "lucide-react";

export default function InsumosPage() {
  const { fincas, currentUser, insumos } = useApp();
  const [showForm, setShowForm] = useState(false);
  
  const fincaAsignadaNombre = (() => {
    if (!currentUser?.fincaAsignada) return null;
    const f = fincas.find((fi) => fi.id === currentUser.fincaAsignada || fi.nombre === currentUser.fincaAsignada);
    return f?.nombre || currentUser.fincaAsignada;
  })();
  const esFiltrado = currentUser?.rol === 'supervisor_finca' || currentUser?.rol === 'bodeguero';

  // Calcular alertas de stock
  const stockBajo = insumos.filter((i) => i.stockActual < i.stockMinimo);
  const stockCritico = insumos.filter((i) => i.stockActual <= i.stockMinimo * 0.5);
  
  // Calcular próximos a vencer (30 días)
  const hoy = new Date();
  const proximosVencer = insumos.filter((i) => {
    if (!i.fechaVencimiento) return false;
    const venc = new Date(i.fechaVencimiento);
    const diff = (venc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 30;
  });

  return (
    <div className="responsive-container space-y-4 md:space-y-6 overflow-x-hidden px-4 md:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Gestión de Insumos
            </h1>
            {esFiltrado && fincaAsignadaNombre && (
              <Badge variant="outline" className="gap-1">
                <MapPin className="h-3 w-3" />
                {fincaAsignadaNombre}
              </Badge>
            )}
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            Control de inventario {esFiltrado && fincaAsignadaNombre ? `de ${fincaAsignadaNombre}` : "con alertas automáticas"}
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"}>
          {showForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          {showForm ? "Cancelar" : "Nuevo Insumo"}
        </Button>
      </div>

      {/* Alertas de Stock */}
      {(stockBajo.length > 0 || proximosVencer.length > 0) && (
        <div className="grid gap-4 md:grid-cols-3">
          {stockCritico.length > 0 && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  Stock Crítico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">{stockCritico.length}</p>
                <p className="text-xs text-red-600 dark:text-red-500">
                  {stockCritico.slice(0, 2).map(i => i.nombre).join(', ')}
                  {stockCritico.length > 2 && ` +${stockCritico.length - 2} más`}
                </p>
              </CardContent>
            </Card>
          )}
          
          {stockBajo.length > stockCritico.length && (
            <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                  <Package className="h-4 w-4" />
                  Stock Bajo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{stockBajo.length - stockCritico.length}</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-500">Requieren reposición pronto</p>
              </CardContent>
            </Card>
          )}
          
          {proximosVencer.length > 0 && (
            <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-orange-700 dark:text-orange-400">
                  <Calendar className="h-4 w-4" />
                  Próximos a Vencer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{proximosVencer.length}</p>
                <p className="text-xs text-orange-600 dark:text-orange-500">En los próximos 30 días</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {showForm && (
        <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <InsumoForm />
          </div>
        </div>
      )}

      <InsumosTable />
    </div>
  );
}
