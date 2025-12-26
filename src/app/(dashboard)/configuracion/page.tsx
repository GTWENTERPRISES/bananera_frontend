"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Settings, Users, MapPin, Shield } from "lucide-react";
import { useApp } from "@/src/contexts/app-context";

export default function ConfiguracionIndexPage() {
  const { canAccess } = useApp();
  const allow = canAccess("configuracion", "view");

  if (!allow) {
    return (
      <div className="rounded-lg border p-6">
        <h2 className="text-xl font-semibold">Acceso restringido</h2>
        <p className="text-muted-foreground">No tienes permisos para ver configuración.</p>
      </div>
    );
  }

  return (
    <div className="responsive-container space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Configuración</h2>
          <p className="text-sm md:text-base text-muted-foreground">Administración de usuarios, fincas y permisos</p>
        </div>
        <Settings className="h-6 w-6 text-muted-foreground" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Usuarios</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 md:flex-row md:justify-between md:items-end">
            <p className="text-sm text-muted-foreground">Gestión de cuentas y roles</p>
            <Link href="/configuracion/usuarios"><Button className="w-full md:w-auto">Administrar</Button></Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Fincas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 md:flex-row md:justify-between md:items-end">
            <p className="text-sm text-muted-foreground">Información de fincas</p>
            <Link href="/configuracion/fincas"><Button className="w-full md:w-auto">Administrar</Button></Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Permisos</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 md:flex-row md:justify-between md:items-end">
            <p className="text-sm text-muted-foreground">Reglas de acceso por rol</p>
            <Link href="/configuracion/permisos"><Button className="w-full md:w-auto">Administrar</Button></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
