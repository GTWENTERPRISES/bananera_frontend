"use client";

import { useState } from "react";
import { Bell, Moon, Sun, User, LogOut, AlertCircle, AlertTriangle, Info, Search, Users, Package, Sprout, FileText } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/components/ui/command";
import { Badge } from "@/src/components/ui/badge";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { useApp } from "@/src/contexts/app-context";
import { useIsMobile } from "@/src/hooks/use-mobile";
import { cn } from "@/src/lib/utils";

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, theme, toggleTheme, alertas, fincas, logout, canAccess, marcarAlertaLeida } = useApp();
  const isMobile = useIsMobile();
  const [searchOpen, setSearchOpen] = useState(false);
  
  const fincaAsignadaNombre = (() => {
    if (!currentUser?.fincaAsignada) return undefined;
    const f = fincas.find((fi) => fi.id === currentUser.fincaAsignada);
    return f?.nombre;
  })();

  // Módulos del sidebar para búsqueda
  const modulos = [
    { id: 'dashboard', label: 'Dashboard', description: 'Vista general', href: '/dashboard', icon: Sprout },
    { id: 'enfundes', label: 'Enfundes', description: 'Registro de enfundes', href: '/produccion/enfundes', icon: Sprout },
    { id: 'cosechas', label: 'Cosechas', description: 'Control de cosechas', href: '/produccion/cosechas', icon: Sprout },
    { id: 'recuperacion', label: 'Recuperación', description: 'Cintas recuperadas', href: '/produccion/recuperacion', icon: Sprout },
    { id: 'empleados', label: 'Empleados', description: 'Gestión de personal', href: '/nomina/empleados', icon: Users },
    { id: 'roles', label: 'Roles de Pago', description: 'Nómina semanal', href: '/nomina/roles', icon: FileText },
    { id: 'prestamos', label: 'Préstamos', description: 'Adelantos y cuotas', href: '/nomina/prestamos', icon: FileText },
    { id: 'insumos', label: 'Insumos', description: 'Inventario', href: '/inventario/insumos', icon: Package },
    { id: 'movimientos', label: 'Movimientos', description: 'Entradas y salidas', href: '/inventario/movimientos', icon: Package },
    { id: 'alertas', label: 'Alertas', description: 'Stock bajo', href: '/inventario/alertas', icon: Package },
    { id: 'reportes', label: 'Reportes', description: 'Análisis y métricas', href: '/reportes', icon: FileText },
    { id: 'usuarios', label: 'Usuarios', description: 'Gestión de cuentas', href: '/configuracion/usuarios', icon: Users },
    { id: 'fincas', label: 'Fincas', description: 'Propiedades', href: '/configuracion/fincas', icon: Sprout },
  ];

  const alertasVisibles = (alertas || []).filter((a) => {
    if (!currentUser) return false;
    const rolPermitido = a.rolesPermitidos?.includes(currentUser.rol);
    const aplicaFinca = currentUser.rol === "supervisor_finca";
    const fincaOk = !aplicaFinca || !a.finca || a.finca === fincaAsignadaNombre;
    return rolPermitido && fincaOk;
  });
  const inventarioVisibles = alertasVisibles.filter((a) => (a.modulo || "").toLowerCase() === "inventario");
  const alertasCount = inventarioVisibles.length;

  const MAX_VISIBLE = isMobile ? 5 : 8;
  const totalVisibles = inventarioVisibles.length;
  const extraCount = Math.max(totalVisibles - MAX_VISIBLE, 0);
  const countCritico = inventarioVisibles.filter((a) => a.tipo === "critico").length;
  const countAdvertencia = inventarioVisibles.filter((a) => a.tipo === "advertencia").length;
  const countInfo = inventarioVisibles.filter((a) => a.tipo === "info").length;

  const getAlertHref = (a: { modulo: string; finca?: string; titulo?: string }) => {
    let base = "/dashboard";
    const modulo = (a.modulo || "").toLowerCase();
    if (modulo === "inventario") base = "/inventario/alertas";
    else if (modulo === "producción" || modulo === "produccion") {
      const t = a.titulo?.toLowerCase() || "";
      base = t.includes("recuperación") ? "/produccion/recuperacion" : "/produccion/cosechas";
    }
    else if (modulo === "nómina" || modulo === "nomina") {
      const t = a.titulo?.toLowerCase() || "";
      base = t.includes("roles de pago") ? "/nomina/roles" : "/nomina/empleados";
    }
    else if (modulo === "analytics") base = "/analytics/predictivo";
    else if (modulo === "seguridad") base = "/configuracion/permisos";
    else if (modulo === "sistema") base = "/dashboard";
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
    <>
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex flex-1 items-center gap-4">
        {/* Búsqueda global */}
        <Button
          variant="outline"
          className="relative h-9 w-full max-w-sm justify-start text-sm text-muted-foreground sm:pr-12"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="mr-2 h-4 w-4" />
          <span className="hidden lg:inline-flex">Buscar módulos...</span>
          <span className="inline-flex lg:hidden">Buscar...</span>
          <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
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
              {alertasCount > 0 && (
                <Badge
                  variant="destructive"
                  aria-label={`Notificaciones: ${alertasCount}`}
                  className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1 text-xs"
                >
                  {alertasCount > 99 ? "99+" : alertasCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="bottom" sideOffset={8} className="dropdown-notif rounded-xl p-0">
            <DropdownMenuLabel className="sticky top-0 z-10 bg-popover px-3 py-2 text-sm">
              <div className="notif-header flex items-center justify-between gap-2">
                <span>Notificaciones</span>
                {extraCount > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>Mostrando {Math.min(MAX_VISIBLE, totalVisibles)} de {totalVisibles}</span>
                    <span>•</span>
                    <span>+{extraCount} más</span>
                  </div>
                )}
              </div>
              {extraCount > 0 && (
                <div className="notif-summary mt-1 flex items-center gap-1">
                  {countCritico > 0 && (
                    <Badge variant="destructive" className="px-1 py-0 text-[10px]">{countCritico} críticas</Badge>
                  )}
                  {countAdvertencia > 0 && (
                    <Badge variant="secondary" className="px-1 py-0 text-[10px]">{countAdvertencia} bajas</Badge>
                  )}
                  {countInfo > 0 && (
                    <Badge variant="outline" className="px-1 py-0 text-[10px]">{countInfo} info</Badge>
                  )}
                </div>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ScrollArea className="list-scroll overflow-y-auto">
              {alertasVisibles.length === 0 && (
                <div className="p-3 text-xs text-muted-foreground">Sin notificaciones para tu rol</div>
              )}
              {inventarioVisibles.slice(0, MAX_VISIBLE).map((a) => (
                <DropdownMenuItem
                  key={a.id}
                  className="px-3 py-2"
                  onClick={() => {
                    marcarAlertaLeida(a.id);
                    const href = getAlertHref(a);
                    router.push(href);
                  }}
                >
                  <div className="flex items-start gap-3 w-full">
                    <span className={cn(
                      a.tipo === "critico" ? "text-destructive" :
                      a.tipo === "advertencia" ? "text-secondary" : "text-primary",
                      "mt-0.5"
                    )}>
                      {(a.tipo === "critico" ? <AlertCircle className="h-4 w-4" /> : a.tipo === "advertencia" ? <AlertTriangle className="h-4 w-4" /> : <Info className="h-4 w-4" />)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="notif-title text-sm font-medium truncate">{a.titulo}</p>
                      <p className="notif-desc text-xs text-muted-foreground">{a.descripcion}</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </ScrollArea>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="sticky bottom-0 bg-popover px-3 py-2"
              onClick={() => {
                const qp = currentUser?.rol === "supervisor_finca" && fincaAsignadaNombre ? `?finca=${encodeURIComponent(fincaAsignadaNombre)}` : "";
                router.push(`/inventario/alertas${qp}`);
              }}
            >
              {extraCount > 0 ? `Ver +${extraCount} más` : "Ver todas las alertas"}
            </DropdownMenuItem>
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

    {/* Búsqueda global con CommandDialog */}
    <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
      <CommandInput placeholder="Buscar módulos..." />
      <CommandList>
        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
        <CommandGroup heading="Módulos">
          {modulos.map((item) => (
            <CommandItem
              key={item.id}
              onSelect={() => {
                router.push(item.href);
                setSearchOpen(false);
              }}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
              <span className="ml-2 text-xs text-muted-foreground">{item.description}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
    </>
  );
}
