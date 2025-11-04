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
  supervisor: boolean;
  operador: boolean;
  consulta: boolean;
}

const permisos: Permiso[] = [
  {
    modulo: "Dashboard",
    administrador: true,
    gerente: true,
    supervisor: true,
    operador: true,
    consulta: true,
  },
  {
    modulo: "Producción - Ver",
    administrador: true,
    gerente: true,
    supervisor: true,
    operador: true,
    consulta: true,
  },
  {
    modulo: "Producción - Editar",
    administrador: true,
    gerente: true,
    supervisor: true,
    operador: true,
    consulta: false,
  },
  {
    modulo: "Nómina - Ver",
    administrador: true,
    gerente: true,
    supervisor: false,
    operador: false,
    consulta: false,
  },
  {
    modulo: "Nómina - Editar",
    administrador: true,
    gerente: true,
    supervisor: false,
    operador: false,
    consulta: false,
  },
  {
    modulo: "Inventario - Ver",
    administrador: true,
    gerente: true,
    supervisor: true,
    operador: true,
    consulta: true,
  },
  {
    modulo: "Inventario - Editar",
    administrador: true,
    gerente: true,
    supervisor: true,
    operador: false,
    consulta: false,
  },
  {
    modulo: "Reportes",
    administrador: true,
    gerente: true,
    supervisor: true,
    operador: false,
    consulta: true,
  },
  {
    modulo: "Configuración",
    administrador: true,
    gerente: false,
    supervisor: false,
    operador: false,
    consulta: false,
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
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Módulo / Acción</TableHead>
                <TableHead className="text-center">
                  <Badge className="bg-red-500">Administrador</Badge>
                </TableHead>
                <TableHead className="text-center">
                  <Badge className="bg-orange-500">Gerente</Badge>
                </TableHead>
                <TableHead className="text-center">
                  <Badge className="bg-blue-500">Supervisor</Badge>
                </TableHead>
                <TableHead className="text-center">
                  <Badge className="bg-green-500">Operador</Badge>
                </TableHead>
                <TableHead className="text-center">
                  <Badge variant="secondary">Consulta</Badge>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permisos.map((permiso, index) => (
                <TableRow key={index}>
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
                    {permiso.supervisor ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-red-500 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {permiso.operador ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-red-500 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {permiso.consulta ? (
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
              <strong>Gerente:</strong> Acceso a todas las fincas, puede ver y
              editar producción, nómina y reportes
            </li>
            <li>
              <strong>Supervisor:</strong> Acceso limitado a su finca asignada,
              gestión de producción e inventario
            </li>
            <li>
              <strong>Operador:</strong> Registro de datos de producción y
              consulta de información básica
            </li>
            <li>
              <strong>Consulta:</strong> Solo lectura de dashboard, producción,
              inventario y reportes
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
