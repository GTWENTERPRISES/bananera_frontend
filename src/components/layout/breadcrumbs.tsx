"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import { Fragment } from "react"

const labelMap: Record<string, string> = {
  dashboard: "Dashboard",
  produccion: "Producción",
  enfundes: "Enfundes",
  cosechas: "Cosechas",
  recuperacion: "Recuperación",
  nomina: "Nómina",
  empleados: "Empleados",
  roles: "Roles de Pago",
  prestamos: "Préstamos",
  inventario: "Inventario",
  insumos: "Insumos",
  movimientos: "Movimientos",
  alertas: "Alertas",
  reportes: "Reportes",
  financiero: "Financiero",
  configuracion: "Configuración",
  usuarios: "Usuarios",
  fincas: "Fincas",
  permisos: "Permisos",
  perfil: "Mi Perfil",
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/")
    const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
    return { href, label }
  })

  if (breadcrumbs.length === 0) return null

  return (
    <nav className="flex items-center gap-2 text-sm bg-muted/50 px-4 py-2 rounded-lg mb-4">
      <Link 
        href="/dashboard" 
        className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
        title="Ir al Dashboard"
      >
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">Inicio</span>
      </Link>

      {breadcrumbs.map((crumb, index) => (
        <Fragment key={crumb.href}>
          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          {index === breadcrumbs.length - 1 ? (
            <span className="font-semibold text-foreground">{crumb.label}</span>
          ) : (
            <Link 
              href={crumb.href} 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  )
}
