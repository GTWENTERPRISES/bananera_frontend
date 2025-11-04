"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import type { Finca } from "@/src/lib/types";
import { Save, X, AlertCircle } from "lucide-react";

interface FincaFormProps {
  finca?: Finca;
  onSave: (finca: Partial<Finca>) => void;
  onCancel: () => void;
}

export function FincaForm({ finca, onSave, onCancel }: FincaFormProps) {
  const [formData, setFormData] = useState<Partial<Finca>>({
    nombre: finca?.nombre || "",
    hectareas: finca?.hectareas || 0,
    ubicacion: finca?.ubicacion || "",
    responsable: finca?.responsable || "",
    variedad: finca?.variedad || "Cavendish",
    plantasTotales: finca?.plantasTotales || 0,
    fechaSiembra: finca?.fechaSiembra || "",
    estado: finca?.estado || "activa",
    coordenadas: finca?.coordenadas || "",
    telefono: finca?.telefono || "",
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Resetear error al enviar

    // Validaciones - Usar valores por defecto para evitar undefined
    if (
      !formData.nombre?.trim() ||
      !formData.responsable?.trim() ||
      !formData.variedad?.trim()
    ) {
      setError("Nombre, responsable y variedad son campos obligatorios");
      return;
    }

    // Usar valores por defecto y asegurar que no sean undefined
    const hectareas = formData.hectareas || 0;
    const plantasTotales = formData.plantasTotales || 0;

    if (hectareas <= 0 || plantasTotales <= 0) {
      setError("Hectáreas y plantas totales deben ser mayores a 0");
      return;
    }

    // Asegurar que los campos numéricos tengan valores válidos
    const dataToSave: Partial<Finca> = {
      ...formData,
      hectareas: hectareas,
      plantasTotales: plantasTotales,
      nombre: formData.nombre.trim(),
      responsable: formData.responsable.trim(),
      variedad: formData.variedad.trim(),
    };

    onSave(dataToSave);
  };

  // Función auxiliar para manejar cambios en campos numéricos
  const handleNumberChange = (field: keyof Finca, value: string) => {
    const numValue = value === "" ? 0 : Number.parseFloat(value);
    setFormData((prev) => ({
      ...prev,
      [field]: isNaN(numValue) ? 0 : numValue,
    }));
    // Limpiar error cuando el usuario empiece a corregir
    if (error) setError(null);
  };

  // Función auxiliar para manejar cambios en campos de texto
  const handleTextChange = (field: keyof Finca, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Limpiar error cuando el usuario empiece a corregir
    if (error) setError(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{finca ? "Editar Finca" : "Nueva Finca"}</CardTitle>
        <CardDescription>
          {finca
            ? "Actualiza la información de la finca"
            : "Registra una nueva finca en el sistema"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Alert de error */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Columna 1 */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre de la Finca *</Label>
              <Input
                id="nombre"
                value={formData.nombre || ""}
                onChange={(e) => handleTextChange("nombre", e.target.value)}
                placeholder="BABY"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hectareas">Hectáreas *</Label>
              <Input
                id="hectareas"
                type="number"
                step="0.01"
                min="0"
                value={formData.hectareas || 0}
                onChange={(e) =>
                  handleNumberChange("hectareas", e.target.value)
                }
                placeholder="45.5"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsable">Responsable *</Label>
              <Input
                id="responsable"
                value={formData.responsable || ""}
                onChange={(e) =>
                  handleTextChange("responsable", e.target.value)
                }
                placeholder="Juan Pérez"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="variedad">Variedad de Banano *</Label>
              <Select
                value={formData.variedad || "Cavendish"}
                onValueChange={(value) => handleTextChange("variedad", value)}
              >
                <SelectTrigger id="variedad">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cavendish">Cavendish</SelectItem>
                  <SelectItem value="Williams">Williams</SelectItem>
                  <SelectItem value="Grand Naine">Grand Naine</SelectItem>
                  <SelectItem value="Valery">Valery</SelectItem>
                  <SelectItem value="Otra">Otra variedad</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Columna 2 */}
            <div className="space-y-2">
              <Label htmlFor="plantasTotales">Plantas Totales *</Label>
              <Input
                id="plantasTotales"
                type="number"
                min="0"
                value={formData.plantasTotales || 0}
                onChange={(e) =>
                  handleNumberChange("plantasTotales", e.target.value)
                }
                placeholder="50000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={formData.estado || "activa"}
                onValueChange={(value) => handleTextChange("estado", value)}
              >
                <SelectTrigger id="estado">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activa">Activa</SelectItem>
                  <SelectItem value="inactiva">Inactiva</SelectItem>
                  <SelectItem value="mantenimiento">
                    En mantenimiento
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono Contacto</Label>
              <Input
                id="telefono"
                value={formData.telefono || ""}
                onChange={(e) => handleTextChange("telefono", e.target.value)}
                placeholder="0987654321"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaSiembra">Fecha de Siembra</Label>
              <Input
                id="fechaSiembra"
                type="date"
                value={formData.fechaSiembra || ""}
                onChange={(e) =>
                  handleTextChange("fechaSiembra", e.target.value)
                }
              />
            </div>

            {/* Campos de ancho completo */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="ubicacion">Ubicación</Label>
              <Textarea
                id="ubicacion"
                value={formData.ubicacion || ""}
                onChange={(e) => handleTextChange("ubicacion", e.target.value)}
                placeholder="Km 26 vía Machala - Pasaje"
                rows={2}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="coordenadas">Coordenadas GPS</Label>
              <Input
                id="coordenadas"
                value={formData.coordenadas || ""}
                onChange={(e) =>
                  handleTextChange("coordenadas", e.target.value)
                }
                placeholder="-3.2846, -79.9608"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {finca ? "Actualizar" : "Crear"} Finca
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
