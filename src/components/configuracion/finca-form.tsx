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
import { FincaSchema } from "@/src/lib/validation";
import { Spinner } from "@/src/components/ui/spinner";

interface FincaFormProps {
  finca?: Finca;
  onSave: (finca: Partial<Finca>) => void;
  onCancel: () => void;
}

export function FincaForm({ finca, onSave, onCancel }: FincaFormProps) {
  const { canAccess } = useApp();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    // nueva propiedad para geometría
    geom: finca?.geom,
  });

  const [error, setError] = useState<string | null>(null);
  const allowEdit = canAccess("configuracion", "edit");

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!allowEdit) {
      toast({ title: "Permiso requerido", description: "Tu rol no puede modificar fincas", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    const parsed = FincaSchema.safeParse({
      nombre: formData.nombre || "",
      hectareas: String(formData.hectareas ?? ""),
      ubicacion: formData.ubicacion || undefined,
      responsable: formData.responsable || undefined,
      variedad: (formData.variedad || "Cavendish") as any,
      plantasTotales: String(formData.plantasTotales ?? ""),
      fechaSiembra: formData.fechaSiembra || undefined,
      estado: (formData.estado || "activa") as any,
      coordenadas: formData.coordenadas || undefined,
      telefono: formData.telefono || undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message || "Revisa los campos");
      setIsSubmitting(false);
      return;
    }
    try {
      onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Funciones auxiliares
  const handleTextChange = (field: keyof Finca, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (error) setError(null);
  };

  const handleNumberChange = (field: keyof Finca, value: string) => {
    const num = Number.parseFloat(value);
    setFormData((prev) => ({
      ...prev,
      [field]: Number.isFinite(num) ? num : (prev[field] as number) || 0,
    }));
    if (error) setError(null);
  };

  // Parseador sencillo de GeoJSON (Polygon/MultiPolygon)
  const handleGeomJsonChange = (value: string) => {
    setFormData((prev) => ({ ...prev, geom: undefined }));
    if (!value.trim()) return;
    try {
      const parsed = JSON.parse(value);
      if (
        parsed &&
        (parsed.type === "Polygon" || parsed.type === "MultiPolygon") &&
        parsed.coordinates
      ) {
        setFormData((prev) => ({ ...prev, geom: parsed }));
        setError(null);
      } else if (parsed.type === "Feature" && parsed.geometry) {
        const g = parsed.geometry;
        if (
          g &&
          (g.type === "Polygon" || g.type === "MultiPolygon") &&
          g.coordinates
        ) {
          setFormData((prev) => ({ ...prev, geom: g }));
          setError(null);
        } else {
          setError("GeoJSON inválido: se espera Polygon/MultiPolygon.");
        }
      } else {
        setError("GeoJSON inválido: se espera Polygon/MultiPolygon o Feature.");
      }
    } catch (e) {
      setError("GeoJSON inválido: error de parseo.");
    }
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
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre de la Finca *</Label>
              <Input
                id="nombre"
                value={formData.nombre || ""}
                onChange={(e) => handleTextChange("nombre", e.target.value)}
                placeholder="BABY"
                disabled={isSubmitting || !allowEdit}
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
                onChange={(e) => handleNumberChange("hectareas", e.target.value)}
                disabled={isSubmitting || !allowEdit}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="variedad">Variedad *</Label>
              <Select
                value={formData.variedad || "Cavendish"}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, variedad: v }))
                }
                disabled={isSubmitting || !allowEdit}
              >
                <SelectTrigger id="variedad">
                  <SelectValue placeholder="Selecciona variedad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cavendish">Cavendish</SelectItem>
                  <SelectItem value="Clon">Clon</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plantasTotales">Plantas Totales</Label>
              <Input
                id="plantasTotales"
                type="number"
                min="0"
                value={formData.plantasTotales || 0}
                onChange={(e) => handleNumberChange("plantasTotales", e.target.value)}
                disabled={isSubmitting || !allowEdit}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsable">Responsable</Label>
              <Input
                id="responsable"
                value={formData.responsable || ""}
                onChange={(e) => handleTextChange("responsable", e.target.value)}
                placeholder="Juan Pérez"
                disabled={isSubmitting || !allowEdit}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaSiembra">Fecha de Siembra</Label>
              <Input
                id="fechaSiembra"
                type="date"
                value={formData.fechaSiembra || ""}
                onChange={(e) => handleTextChange("fechaSiembra", e.target.value)}
                disabled={isSubmitting || !allowEdit}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="ubicacion">Ubicación</Label>
              <Textarea
                id="ubicacion"
                value={formData.ubicacion || ""}
                onChange={(e) => handleTextChange("ubicacion", e.target.value)}
                placeholder="Km 26 vía Machala - Pasaje"
                rows={2}
                disabled={isSubmitting || !allowEdit}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="coordenadas">Coordenadas GPS</Label>
              <Input
                id="coordenadas"
                value={formData.coordenadas || ""}
                onChange={(e) => handleTextChange("coordenadas", e.target.value)}
                placeholder="-3.2846, -79.9608"
                disabled={isSubmitting || !allowEdit}
              />
            </div>

            {/* Nuevo campo: GeoJSON */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="geomJson">GeoJSON (Polygon o Feature)</Label>
              <Textarea
                id="geomJson"
                value={formData.geom ? JSON.stringify(formData.geom) : ""}
                onChange={(e) => handleGeomJsonChange(e.target.value)}
                placeholder='{"type":"Polygon","coordinates":[[[-79.4445,-1.117],[-79.4417,-1.117],[-79.4417,-1.1135],[-79.4445,-1.1135],[-79.4445,-1.117]]]}'
                rows={4}
                disabled={isSubmitting || !allowEdit}
              />
              <p className="text-xs text-muted-foreground">
                Pega aquí el GeoJSON de la finca (Polygon/MultiPolygon) o un Feature con geometry.
              </p>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={!allowEdit || isSubmitting}>
              {isSubmitting ? <Spinner className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {finca ? "Actualizar" : "Crear"} Finca
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
import { useApp } from "@/src/contexts/app-context";
import { useToast } from "@/src/hooks/use-toast";
