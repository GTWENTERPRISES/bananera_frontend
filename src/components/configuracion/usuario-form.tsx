"use client";

import type React from "react";
import { useState } from "react";
import { useApp } from "@/src/contexts/app-context";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
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
import type { User, UserRole, Finca } from "@/src/lib/types";
import { Save, X } from "lucide-react";

interface UsuarioFormProps {
  usuario?: User;
  onSave: (usuario: Partial<User>) => void;
  onCancel: () => void;
  fincas: Finca[];
  currentUserRole?: string;
}

export function UsuarioForm({
  usuario,
  onSave,
  onCancel,
  fincas,
  currentUserRole,
}: UsuarioFormProps) {
  const [formData, setFormData] = useState<Partial<User>>({
    nombre: usuario?.nombre || "",
    email: usuario?.email || "",
    password: usuario?.password || "",
    rol: usuario?.rol || "operador",
    fincaAsignada: usuario?.fincaAsignada || "",
    telefono: usuario?.telefono || "",
    activo: usuario?.activo ?? true,
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.nombre || !formData.email) {
      alert("Nombre y email son obligatorios");
      return;
    }

    // Si es nuevo usuario y no hay contraseña, establecer una por defecto
    if (!usuario && !formData.password) {
      formData.password = "123456";
    }

    onSave(formData);
  };

  // Restringir la asignación de rol administrador solo a administradores actuales
  const canAssignAdminRole = currentUserRole === "administrador";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{usuario ? "Editar Usuario" : "Nuevo Usuario"}</CardTitle>
        <CardDescription>
          {usuario
            ? "Actualiza la información del usuario"
            : "Registra un nuevo usuario en el sistema"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                placeholder="Juan Pérez"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="juan@bananerashg.com"
                required
              />
            </div>

            {!usuario && (
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Dejar vacío para contraseña por defecto"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Si se deja vacío, se asignará "123456"
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
                placeholder="0999999999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rol">Rol *</Label>
              <Select
                value={formData.rol}
                onValueChange={(value) =>
                  setFormData({ ...formData, rol: value as UserRole })
                }
              >
                <SelectTrigger id="rol">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {canAssignAdminRole && (
                    <SelectItem value="administrador">Administrador</SelectItem>
                  )}
                  <SelectItem value="gerente">Gerente</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="operador">Operador</SelectItem>
                  <SelectItem value="consulta">Consulta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="finca">Finca Asignada</Label>
              <Select
                value={formData.fincaAsignada}
                onValueChange={(value) =>
                  setFormData({ ...formData, fincaAsignada: value })
                }
              >
                <SelectTrigger id="finca">
                  <SelectValue placeholder="Seleccionar finca" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las fincas</SelectItem>
                  {fincas.map((finca) => (
                    <SelectItem key={finca.id} value={finca.id}>
                      {finca.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activo">Estado</Label>
              <Select
                value={formData.activo ? "activo" : "inactivo"}
                onValueChange={(value) =>
                  setFormData({ ...formData, activo: value === "activo" })
                }
              >
                <SelectTrigger id="activo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {usuario ? "Actualizar" : "Crear"} Usuario
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
