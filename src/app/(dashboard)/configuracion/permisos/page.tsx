import { PermisosMatrix } from "@/src/components/configuracion/permisos-matrix"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Shield } from "lucide-react"

export default function PermisosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Permisos y Roles</h1>
        <p className="text-muted-foreground">Configuración de permisos por rol de usuario</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sistema de Seguridad
          </CardTitle>
          <CardDescription>El sistema implementa control de acceso basado en roles (RBAC)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold">Características de Seguridad:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                <li>Autenticación multifactor disponible</li>
                <li>Historial de accesos por usuario</li>
                <li>Bloqueo automático tras intentos fallidos</li>
                <li>Sesiones con tiempo de expiración</li>
                <li>Auditoría de cambios en datos críticos</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Políticas de Contraseña:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                <li>Mínimo 8 caracteres</li>
                <li>Combinación de mayúsculas y minúsculas</li>
                <li>Al menos un número y un carácter especial</li>
                <li>Cambio obligatorio cada 90 días</li>
                <li>No reutilizar últimas 5 contraseñas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <PermisosMatrix />
    </div>
  )
}
