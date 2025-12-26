"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Check, X } from "lucide-react";

interface Permiso {
  modulo: string;
  administrador: boolean;
  gerente: boolean;
  supervisor_finca: boolean;
  contador_rrhh: boolean;
  bodeguero: boolean;
}

const permisos: Permiso[] = [
  {
    modulo: "Dashboard",
    administrador: true,
    gerente: true,
    supervisor_finca: true,
    contador_rrhh: true,
    bodeguero: true,
  },
  {
    modulo: "Producción - Ver",
    administrador: true,
    gerente: true,
    supervisor_finca: true,
    contador_rrhh: false,
    bodeguero: false,
  },
  {
    modulo: "Producción - Editar",
    administrador: true,
    gerente: false,
    supervisor_finca: true,
    contador_rrhh: false,
    bodeguero: false,
  },
  {
    modulo: "Nómina - Ver",
    administrador: true,
    gerente: true,
    supervisor_finca: false,
    contador_rrhh: true,
    bodeguero: false,
  },
  {
    modulo: "Nómina - Editar",
    administrador: true,
    gerente: false,
    supervisor_finca: false,
    contador_rrhh: true,
    bodeguero: false,
  },
  {
    modulo: "Inventario - Ver",
    administrador: true,
    gerente: true,
    supervisor_finca: true,
    contador_rrhh: false,
    bodeguero: true,
  },
  {
    modulo: "Inventario - Editar",
    administrador: true,
    gerente: false,
    supervisor_finca: true,
    contador_rrhh: false,
    bodeguero: true,
  },
  {
    modulo: "Reportes",
    administrador: true,
    gerente: true,
    supervisor_finca: true,
    contador_rrhh: true,
    bodeguero: true,
  },
  {
    modulo: "Configuración",
    administrador: true,
    gerente: false,
    supervisor_finca: false,
    contador_rrhh: false,
    bodeguero: false,
  },
];

export function PermisosMatrix() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Matriz de Permisos por Rol</CardTitle>
        <CardDescription>
          Permisos asignados a cada rol en el sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-x-auto overflow-y-auto max-h-[540px]">
          <Table className="text-sm min-w-[900px]">
            <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
              <TableRow>
                <TableHead className="w-[250px]">Módulo / Acción</TableHead>
                <TableHead className="text-center">
                  <Badge className="bg-red-500">Administrador</Badge>
                </TableHead>
                <TableHead className="text-center">
                  <Badge className="bg-orange-500">Gerente</Badge>
                </TableHead>
                <TableHead className="text-center">
                  <Badge className="bg-blue-500">Supervisor Finca</Badge>
                </TableHead>
                <TableHead className="text-center">
                  <Badge className="bg-green-500">Contador/RRHH</Badge>
                </TableHead>
                <TableHead className="text-center">
                  <Badge variant="secondary">Bodeguero</Badge>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permisos.map((permiso, index) => (
                <TableRow key={index} className="odd:bg-muted/50 hover:bg-muted transition-colors">
                  <TableCell className="font-medium">
                    {permiso.modulo}
                  </TableCell>
                  <TableCell className="text-center">
                    {permiso.administrador ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-red-500 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {permiso.gerente ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-red-500 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {permiso.supervisor_finca ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-red-500 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {permiso.contador_rrhh ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-red-500 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {permiso.bodeguero ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-red-500 mx-auto" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-6 space-y-2">
          <h4 className="font-semibold">Descripción de Roles:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>
              <strong>Administrador:</strong> Acceso total al sistema, gestión
              de usuarios y configuración
            </li>
            <li>
              <strong>Gerente:</strong> Visión completa con edición limitada; no cambia configuración ni registra datos
            </li>
            <li>
              <strong>Supervisor de finca:</strong> Opera su finca: producción e inventario de su finca
            </li>
            <li>
              <strong>Contador/RRHH:</strong> Gestión de nómina y personal, reportes y exportaciones
            </li>
            <li>
              <strong>Bodeguero:</strong> Gestión completa de inventario, proveedores y órdenes de compra
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
