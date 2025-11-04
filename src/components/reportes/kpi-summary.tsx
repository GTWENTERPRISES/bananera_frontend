"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { useApp } from "@/src/contexts/app-context";
import { TrendingUp, Users, Package, DollarSign } from "lucide-react";

export function KPISummary() {
  const { enfundes, cosechas, empleados, insumos } = useApp();

  // Usar las propiedades correctas según las interfaces
  const totalEnfundes = enfundes.reduce(
    (sum, e) => sum + e.cantidadEnfundes,
    0
  );
  const totalCosechas = cosechas.reduce((sum, c) => sum + c.racimosCorta, 0);
  const totalEmpleados = empleados.length;
  const valorInventario = insumos.reduce(
    (sum, i) => sum + i.stockActual * i.precioUnitario,
    0
  );

  const kpis = [
    {
      title: "Total Enfundes",
      value: totalEnfundes.toLocaleString(),
      icon: TrendingUp,
      change: "+12.5%",
      positive: true,
    },
    {
      title: "Racimos Cortados",
      value: totalCosechas.toLocaleString(),
      icon: Package,
      change: "+8.3%",
      positive: true,
    },
    {
      title: "Empleados Activos",
      value: totalEmpleados,
      icon: Users,
      change: "+2",
      positive: true,
    },
    {
      title: "Valor Inventario",
      value: `$${valorInventario.toFixed(0)}`,
      icon: DollarSign,
      change: "-3.2%",
      positive: false,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {kpi.value}
              </div>
              <p
                className={`text-xs ${
                  kpi.positive ? "text-green-600" : "text-red-600"
                }`}
              >
                {kpi.change} vs mes anterior
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
