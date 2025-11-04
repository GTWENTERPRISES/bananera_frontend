"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { useApp } from "@/src/contexts/app-context";
import { Badge } from "@/src/components/ui/badge";
import { ExportButton } from "@/src/components/shared/export-button";
import { useState } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Search, Edit, Trash2 } from "lucide-react";

// Extender Date para getWeek si no existe
declare global {
  interface Date {
    getWeek(): number;
  }
}

Date.prototype.getWeek = function () {
  const date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
};

// Mapeo de colores para los badges
const colorMap: { [key: string]: string } = {
  azul: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  rojo: "bg-red-100 text-red-800 hover:bg-red-200",
  verde: "bg-green-100 text-green-800 hover:bg-green-200",
  amarillo: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  naranja: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  violeta: "bg-violet-100 text-violet-800 hover:bg-violet-200",
  gris: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  blanco: "bg-gray-100 text-gray-800 hover:bg-gray-200",
};

export function EnfundesTable() {
  const { enfundes, fincas } = useApp();
  const [searchTerm, setSearchTerm] = useState("");

  // Función para obtener información de la finca
  const getFincaInfo = (fincaName: string) => {
    return fincas.find((f) => f.nombre === fincaName);
  };

  const filteredEnfundes = enfundes.filter(
    (enfunde) =>
      enfunde.finca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enfunde.colorCinta.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEnfundes = enfundes.reduce(
    (sum, e) => sum + e.cantidadEnfundes,
    0
  );
  const totalMatasCaidas = enfundes.reduce((sum, e) => sum + e.matasCaidas, 0);

  // Función segura para obtener la clase del badge
  const getBadgeClass = (color: string) => {
    const colorLower = color.toLowerCase();
    return (
      colorMap[colorLower] || "bg-gray-100 text-gray-800 hover:bg-gray-200"
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Registro de Enfundes</CardTitle>
        <ExportButton
          data={filteredEnfundes}
          headers={[
            "Fecha",
            "Finca",
            "Semana",
            "Año",
            "Color de Cinta",
            "Cantidad de Enfundes",
            "Matas Caídas",
          ]}
          title="Registro de Enfundes"
          filename="registro-enfundes.xlsx"
        />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Enfundes</p>
            <p className="text-2xl font-bold text-foreground">
              {totalEnfundes.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Matas Caídas</p>
            <p className="text-2xl font-bold text-destructive">
              {totalMatasCaidas.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Semana Actual</p>
            <p className="text-2xl font-bold text-foreground">
              {new Date().getWeek()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por finca o color de cinta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Finca</TableHead>
                <TableHead>Semana</TableHead>
                <TableHead>Año</TableHead>
                <TableHead>Color de Cinta</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Matas Caídas</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnfundes.map((enfunde) => {
                const fincaInfo = getFincaInfo(enfunde.finca);
                return (
                  <TableRow key={enfunde.id}>
                    <TableCell>
                      {new Date(enfunde.fecha).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{enfunde.finca}</TableCell>
                    <TableCell>{enfunde.semana}</TableCell>
                    <TableCell>{enfunde.año}</TableCell>
                    <TableCell>
                      <Badge className={getBadgeClass(enfunde.colorCinta)}>
                        {enfunde.colorCinta}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {enfunde.cantidadEnfundes.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {enfunde.matasCaidas.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {fincaInfo?.responsable || "No asignado"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
