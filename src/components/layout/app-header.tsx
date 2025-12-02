"use client";

import { Bell, Search, Moon, Sun, User, LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Badge } from "@/src/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { useApp } from "@/src/contexts/app-context";
import { useIsMobile } from "@/src/hooks/use-mobile";
import { cn } from "@/src/lib/utils";

export function AppHeader() {
  const router = useRouter();
  const { currentUser, theme, toggleTheme, alertas, fincas, logout, canAccess, marcarAlertaLeida } = useApp();
  const isMobile = useIsMobile();
  const fincaAsignadaNombre = (() => {
    if (!currentUser?.fincaAsignada) return undefined;
    const f = fincas.find((fi) => fi.id === currentUser.fincaAsignada);
    return f?.nombre;
  })();

  const alertasVisibles = (alertas || []).filter((a) => {
    if (!currentUser) return false;
    const rolPermitido = a.rolesPermitidos?.includes(currentUser.rol);
    const aplicaFinca = currentUser.rol === "supervisor_finca";
    const fincaOk = !aplicaFinca || !a.finca || a.finca === fincaAsignadaNombre;
    return rolPermitido && fincaOk;
  });

  const alertasNoLeidas = alertasVisibles.filter((a) => !a.leida).length || 0;

  const getAlertHref = (a: { modulo: string; finca?: string; titulo?: string }) => {
    let base = "/dashboard";
    if (a.modulo === "Inventario") base = "/inventario/alertas";
    else if (a.modulo === "Producción") {
      const t = a.titulo?.toLowerCase() || "";
      base = t.includes("recuperación") ? "/produccion/recuperacion" : "/produccion/cosechas";
    }
    else if (a.modulo === "Nómina") {
      const t = a.titulo?.toLowerCase() || "";
      base = t.includes("roles de pago") ? "/nomina/roles" : "/nomina/empleados";
    }
    else if (a.modulo === "Analytics") base = "/analytics/predictivo";
    else if (a.modulo === "Seguridad") base = "/configuracion/permisos";
    else if (a.modulo === "Sistema") base = "/dashboard";
    const qp = a.finca ? `?finca=${encodeURIComponent(a.finca)}` : "";
    return `${base}${qp}`;
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const goPerfil = () => {
    router.push("/perfil");
  };

  const goConfiguracion = () => {
    if (canAccess("configuracion", "view")) {
      router.push("/configuracion");
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex flex-1 items-center gap-4">
        {!isMobile && (
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar en el sistema..."
              className="pl-10"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="relative"
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {alertasNoLeidas > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {alertasNoLeidas}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-96 overflow-y-auto">
              {alertasVisibles.length === 0 && (
                <div className="p-3 text-xs text-muted-foreground">Sin notificaciones para tu rol</div>
              )}
              {alertasVisibles.slice(0, 8).map((a) => (
                <DropdownMenuItem
                  key={a.id}
                  onClick={() => {
                    const href = getAlertHref(a);
                    router.push(href);
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">{a.titulo}</p>
                    <p className="text-xs text-muted-foreground">{a.descripcion}</p>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser?.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">
                  {currentUser?.nombre}
                </span>
                <span className="text-xs text-muted-foreground capitalize">
                  {currentUser?.rol}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={goPerfil}>Perfil</DropdownMenuItem>
            {canAccess("configuracion", "view") && (
              <DropdownMenuItem onClick={goConfiguracion}>Configuración</DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
