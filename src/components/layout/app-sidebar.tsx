"use client";

import type React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sprout,
  Users,
  Package,
  FileText,
  BarChart3,
  Settings,
  ChevronDown,
  Menu,
  X,
  Wallet,
  ClipboardList,
  Boxes,
  AlertTriangle,
  TruckIcon,
  PieChart,
  TrendingUp,
  UserCog,
  Building2,
  Shield,
  Leaf,
  Scissors,
  RefreshCw,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/src/hooks/use-mobile";
import { useApp } from "@/src/hooks/useApp";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  children?: { title: string; href: string; icon?: React.ComponentType<{ className?: string }>; description?: string }[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Vista general del sistema",
  },
  {
    title: "Producción",
    href: "/produccion",
    icon: Sprout,
    description: "Gestión de cultivos y cosechas",
    children: [
      { title: "Enfundes", href: "/produccion/enfundes", icon: Leaf, description: "Registro de enfundes por semana" },
      { title: "Cosechas", href: "/produccion/cosechas", icon: Scissors, description: "Control de racimos y cajas" },
      { title: "Recuperación", href: "/produccion/recuperacion", icon: RefreshCw, description: "Cintas recuperadas" },
    ],
  },
  {
    title: "Nómina",
    href: "/nomina",
    icon: Wallet,
    description: "Gestión de personal y pagos",
    children: [
      { title: "Empleados", href: "/nomina/empleados", icon: Users, description: "Directorio de trabajadores" },
      { title: "Roles de Pago", href: "/nomina/roles", icon: ClipboardList, description: "Pagos semanales" },
      { title: "Préstamos", href: "/nomina/prestamos", icon: Wallet, description: "Adelantos y cuotas" },
    ],
  },
  {
    title: "Inventario",
    href: "/inventario",
    icon: Package,
    description: "Control de insumos y stock",
    children: [
      { title: "Insumos", href: "/inventario/insumos", icon: Boxes, description: "Lista de materiales" },
      { title: "Movimientos", href: "/inventario/movimientos", icon: TruckIcon, description: "Entradas y salidas" },
      { title: "Alertas", href: "/inventario/alertas", icon: AlertTriangle, description: "Stock bajo y vencimientos" },
    ],
  },
  {
    title: "Reportes",
    href: "/reportes",
    icon: BarChart3,
    description: "Informes y análisis",
    children: [
      { title: "General", href: "/reportes", icon: PieChart, description: "Resumen ejecutivo" },
      { title: "Producción", href: "/reportes/produccion", icon: Sprout, description: "Métricas de campo" },
      { title: "Financiero", href: "/reportes/financiero", icon: Wallet, description: "Costos y nómina" },
    ],
  },
  {
    title: "Configuración",
    href: "/configuracion",
    icon: Settings,
    description: "Ajustes del sistema",
    children: [
      { title: "Usuarios", href: "/configuracion/usuarios", icon: UserCog, description: "Gestión de cuentas y permisos" },
      { title: "Fincas", href: "/configuracion/fincas", icon: Building2, description: "Propiedades registradas" },
    ],
  },
  {
    title: "Mi Perfil",
    href: "/perfil",
    icon: Users,
    description: "Tu información personal",
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { canAccess } = useApp();
  const [isOpen, setIsOpen] = useState(!isMobile);
  const [openItems, setOpenItems] = useState<string[]>([
    "Producción",
    "Nómina",
  ]);

  const mapResource = (href: string):
    | "dashboard"
    | "produccion"
    | "nomina"
    | "inventario"
    | "reportes"
    | "configuracion" => {
    if (href.startsWith("/dashboard") || href.startsWith("/perfil")) return "dashboard";
    if (href.startsWith("/produccion")) return "produccion";
    if (href.startsWith("/nomina")) return "nomina";
    if (href.startsWith("/inventario")) return "inventario";
    if (href.startsWith("/reportes")) return "reportes";
    if (href.startsWith("/configuracion")) return "configuracion";
    return "dashboard";
  };

  const visibleNavItems = navItems.filter((item) => canAccess(mapResource(item.href), "view"));

  // Actualizar el estado del sidebar cuando cambia el tamaño de la pantalla
  useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleItem = (title: string) => {
    setOpenItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  return (
    <>
      {isMobile && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="fixed left-4 top-4 z-50"
          onClick={toggleSidebar}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      )}
      
      <div 
        className={cn(
          "flex h-full flex-col border-r border-border bg-card transition-all duration-300",
          isMobile ? (
            isOpen 
              ? "fixed inset-y-0 left-0 z-40 w-64" 
              : "fixed -left-64 inset-y-0 z-40 w-64"
          ) : "w-64"
        )}
      >
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sprout className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground">
                Bananera HG
              </span>
              <span className="text-xs text-muted-foreground">
                Gestión Operacional
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">{visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const isOpen = openItems.includes(item.title);

          if (item.children) {
            return (
              <Collapsible
                key={item.title}
                open={isOpen}
                onOpenChange={() => toggleItem(item.title)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-between",
                      isActive && "bg-accent text-accent-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isOpen && "rotate-180"
                      )}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1 space-y-1 pl-4">
                  {item.children.map((child) => {
                    const isChildActive = pathname === child.href;
                    const ChildIcon = child.icon;
                    return (
                      <TooltipProvider key={child.href} delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link href={child.href}>
                              <Button
                                variant="ghost"
                                className={cn(
                                  "w-full justify-start gap-2 text-sm transition-all hover:translate-x-1",
                                  isChildActive && "bg-accent text-accent-foreground font-medium"
                                )}
                              >
                                {ChildIcon && <ChildIcon className="h-3.5 w-3.5 text-muted-foreground" />}
                                {child.title}
                              </Button>
                            </Link>
                          </TooltipTrigger>
                          {child.description && (
                            <TooltipContent side="right" className="max-w-[200px]">
                              <p className="text-xs">{child.description}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          }

          return (
            <TooltipProvider key={item.href} delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 transition-all hover:translate-x-1",
                        isActive && "bg-accent text-accent-foreground font-medium"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                {item.description && (
                  <TooltipContent side="right" className="max-w-[200px]">
                    <p className="text-xs">{item.description}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </nav>
    </div>
    
    {/* Overlay para cerrar el sidebar en móvil cuando está abierto */}
    {isMobile && isOpen && (
      <div 
        className="fixed inset-0 z-30 bg-black/50" 
        onClick={toggleSidebar}
        aria-hidden="true"
      />
    )}
    </>
  );
}
