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
import { useToast } from "@/src/hooks/use-toast";
import { UsuarioSchema } from "@/src/lib/validation";
import { Spinner } from "@/src/components/ui/spinner";

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
  const { canAccess } = useApp();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Partial<User>>({
    nombre: usuario?.nombre || "",
    email: usuario?.email || "",
    password: usuario?.password || "",
    rol: usuario?.rol || "bodeguero",
    fincaAsignada: usuario?.fincaAsignada || "",
    telefono: usuario?.telefono || "",
    activo: usuario?.activo ?? true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const allowEdit = canAccess("configuracion", "edit");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!allowEdit) {
      toast({ title: "Permiso requerido", description: "Tu rol no puede modificar usuarios", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    const parsed = UsuarioSchema.safeParse({
      nombre: formData.nombre || "",
      email: formData.email || "",
      password: formData.password,
      rol: (formData.rol || "bodeguero") as any,
      fincaAsignada: formData.fincaAsignada,
      telefono: formData.telefono,
      activo: formData.activo ?? true,
    });
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      const fieldErrors: Record<string, string> = {};
      Object.entries(flat.fieldErrors).forEach(([k, v]) => {
        if (v && v.length) fieldErrors[k] = String(v[0]);
      });
      setErrors(fieldErrors);
      toast({ title: "Datos inválidos", description: Object.values(fieldErrors)[0] || "Revisa los campos", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    // Si es nuevo usuario y no hay contraseña, establecer una por defecto
    if (!usuario && !formData.password) {
      formData.password = "123456";
    }

    try {
      onSave(formData);
    } finally {
      setIsSubmitting(false);
      setErrors({});
    }
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
                  (setFormData({ ...formData, nombre: e.target.value }), setErrors((prev) => ({ ...prev, nombre: "" })))
                }
                placeholder="Juan Pérez"
                disabled={isSubmitting || !allowEdit}
                required
              />
              {errors.nombre && (
                <p className="text-xs text-red-600">{errors.nombre}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  (setFormData({ ...formData, email: e.target.value }), setErrors((prev) => ({ ...prev, email: "" })))
                }
                placeholder="juan@bananerashg.com"
                disabled={isSubmitting || !allowEdit}
                required
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email}</p>
              )}
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
                      (setFormData({ ...formData, password: e.target.value }), setErrors((prev) => ({ ...prev, password: "" })))
                    }
                    placeholder="Dejar vacío para contraseña por defecto"
                    disabled={isSubmitting || !allowEdit}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Si se deja vacío, se asignará "123456"
                </p>
                {errors.password && (
                  <p className="text-xs text-red-600">{errors.password}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) =>
                  (setFormData({ ...formData, telefono: e.target.value }), setErrors((prev) => ({ ...prev, telefono: "" })))
                }
                placeholder="0999999999"
                disabled={isSubmitting || !allowEdit}
              />
              {errors.telefono && (
                <p className="text-xs text-red-600">{errors.telefono}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rol">Rol *</Label>
              <Select
                value={formData.rol}
                onValueChange={(value) =>
                  (setFormData({ ...formData, rol: value as UserRole }), setErrors((prev) => ({ ...prev, rol: "" })))
                }
                disabled={isSubmitting || !allowEdit}
              >
                <SelectTrigger id="rol">
                  <SelectValue />
                </SelectTrigger>
              <SelectContent>
                {canAssignAdminRole && (
                  <SelectItem value="administrador">Administrador</SelectItem>
                )}
                <SelectItem value="gerente">Gerente</SelectItem>
                <SelectItem value="supervisor_finca">Supervisor Finca</SelectItem>
                <SelectItem value="contador_rrhh">Contador/RRHH</SelectItem>
                <SelectItem value="bodeguero">Bodeguero</SelectItem>
              </SelectContent>
              </Select>
              {errors.rol && (
                <p className="text-xs text-red-600">{errors.rol}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="finca">Finca Asignada</Label>
              <Select
                value={formData.fincaAsignada}
                onValueChange={(value) =>
                  (setFormData({ ...formData, fincaAsignada: value }), setErrors((prev) => ({ ...prev, fincaAsignada: "" })))
                }
                disabled={isSubmitting || !allowEdit}
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
              {errors.fincaAsignada && (
                <p className="text-xs text-red-600">{errors.fincaAsignada}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="activo">Estado</Label>
              <Select
                value={formData.activo ? "activo" : "inactivo"}
                onValueChange={(value) =>
                  setFormData({ ...formData, activo: value === "activo" })
                }
                disabled={isSubmitting || !allowEdit}
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
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={!allowEdit || isSubmitting}>
              {isSubmitting ? <Spinner className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {usuario ? "Actualizar" : "Crear"} Usuario
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
