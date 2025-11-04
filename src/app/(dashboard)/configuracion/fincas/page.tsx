"use client";

import { useState } from "react";
import { useApp } from "@/src/contexts/app-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { FincaForm } from "@/src/components/configuracion/finca-form";
import { FincasTable } from "@/src/components/configuracion/fincas-table";
import type { Finca } from "@/src/lib/types";
import { Plus, MapPin } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";

export default function FincasPage() {
  const { state, addFinca, updateFinca, deleteFinca } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingFinca, setEditingFinca] = useState<Finca | undefined>();

  const handleSave = (fincaData: Partial<Finca>) => {
    try {
      if (editingFinca) {
        // Actualizar finca existente
        updateFinca(editingFinca.id, fincaData);
        toast.success("Finca actualizada correctamente");
      } else {
        // Crear nueva finca
        const newFinca: Finca = {
          id: Date.now().toString(),
          nombre: fincaData.nombre || "",
          ubicacion: fincaData.ubicacion || "",
          hectareas: fincaData.hectareas || 0,
          plantasTotales: fincaData.plantasTotales || 0,
          variedad: fincaData.variedad || "",
          responsable: fincaData.responsable || "",
          // Propiedades opcionales
          fechaSiembra: fincaData.fechaSiembra,
          estado: fincaData.estado,
          coordenadas: fincaData.coordenadas,
          telefono: fincaData.telefono,
        };
        addFinca(newFinca);
        toast.success("Finca creada correctamente");
      }

      setShowForm(false);
      setEditingFinca(undefined);
    } catch (error) {
      console.error("Error al guardar finca:", error);
      toast.error("Error al guardar la finca");
    }
  };

  const handleEdit = (finca: Finca) => {
    setEditingFinca(finca);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    try {
      // Verificar si la finca está siendo utilizada
      const fincaEnUso =
        state.enfundes.some(
          (e) => e.finca === state.fincas.find((f) => f.id === id)?.nombre
        ) ||
        state.cosechas.some(
          (c) => c.finca === state.fincas.find((f) => f.id === id)?.nombre
        ) ||
        state.empleados.some(
          (emp) => emp.finca === state.fincas.find((f) => f.id === id)?.nombre
        );

      if (fincaEnUso) {
        toast.error(
          "No se puede eliminar la finca porque está siendo utilizada en registros existentes"
        );
        return;
      }

      
        deleteFinca(id);
        toast.success("Finca eliminada correctamente");
      
    } catch (error) {
      console.error("Error al eliminar finca:", error);
      toast.error("Error al eliminar la finca");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingFinca(undefined);
  };

  const handleNewFinca = () => {
    setEditingFinca(undefined);
    setShowForm(true);
  };

  const totalHectareas = state.fincas.reduce((sum, f) => sum + f.hectareas, 0);
  const totalPlantas = state.fincas.reduce(
    (sum, f) => sum + f.plantasTotales,
    0
  );
  const fincasActivas = state.fincas.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestión de Fincas
          </h1>
          <p className="text-muted-foreground">
            Administra las fincas y sus características
          </p>
        </div>
        {!showForm && (
          <Button onClick={handleNewFinca}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Finca
          </Button>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Fincas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fincasActivas}</div>
            <p className="text-xs text-muted-foreground">
              Registradas en el sistema
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Hectáreas Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalHectareas.toFixed(1)} ha
            </div>
            <p className="text-xs text-muted-foreground">Superficie total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Plantas Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalPlantas.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Cultivadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Densidad Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalHectareas > 0
                ? Math.round(totalPlantas / totalHectareas).toLocaleString()
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Plantas por hectárea
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Fincas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Fincas Registradas
          </CardTitle>
          <CardDescription>
            Total: {state.fincas.length} fincas | {totalHectareas.toFixed(1)}{" "}
            hectáreas | {totalPlantas.toLocaleString()} plantas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showForm ? (
            <FincaForm
              finca={editingFinca}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          ) : (
            <FincasTable
              fincas={state.fincas}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
