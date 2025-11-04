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
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/src/hooks/use-mobile";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { title: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Producción",
    href: "/produccion",
    icon: Sprout,
    children: [
      { title: "Enfundes", href: "/produccion/enfundes" },
      { title: "Cosechas", href: "/produccion/cosechas" },
      { title: "Recuperación", href: "/produccion/recuperacion" },
    ],
  },
  {
    title: "Nómina",
    href: "/nomina",
    icon: Users,
    children: [
      { title: "Roles de Pago", href: "/nomina/roles" },
      { title: "Empleados", href: "/nomina/empleados" },
      { title: "Préstamos", href: "/nomina/prestamos" },
    ],
  },
  {
    title: "Inventario",
    href: "/inventario",
    icon: Package,
    children: [
      { title: "Insumos", href: "/inventario/insumos" },
      { title: "Alertas", href: "/inventario/alertas" },
      { title: "Movimientos", href: "/inventario/movimientos" },
    ],
  },
  {
    title: "Reportes",
    href: "/reportes",
    icon: FileText,
    children: [
      { title: "Dashboard", href: "/reportes" },
      { title: "Producción", href: "/reportes/produccion" },
      { title: "Financieros", href: "/reportes/financiero" },
    ],
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    children: [
      { title: "Dashboard", href: "/analytics" },
      { title: "Predictivo", href: "/analytics/predictivo" },
    ],
  },
  {
    title: "Configuración",
    href: "/configuracion",
    icon: Settings,
    children: [
      { title: "Usuarios", href: "/configuracion/usuarios" },
      { title: "Fincas", href: "/configuracion/fincas" },
      { title: "Permisos", href: "/configuracion/permisos" },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);
  const [openItems, setOpenItems] = useState<string[]>([
    "Producción",
    "Nómina",
  ]);

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

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">{navItems.map((item) => {
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
                <CollapsibleContent className="mt-1 space-y-1 pl-6">
                  {item.children.map((child) => {
                    const isChildActive = pathname === child.href;
                    return (
                      <Link key={child.href} href={child.href}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start text-sm",
                            isChildActive && "bg-accent text-accent-foreground"
                          )}
                        >
                          {child.title}
                        </Button>
                      </Link>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          }

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3",
                  isActive && "bg-accent text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{item.title}</span>
              </Button>
            </Link>
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
