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
import { FieldFeedback, getInputClassName } from "@/src/components/ui/field-feedback";

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
  const [touched, setTouched] = useState<Record<string, boolean>>({});
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

  const validateField = (field: string, value: any): string => {
    try {
      const dataToValidate = {
        nombre: formData.nombre || "",
        email: formData.email || "",
        password: formData.password,
        rol: (formData.rol || "bodeguero") as any,
        fincaAsignada: formData.fincaAsignada,
        telefono: formData.telefono,
        activo: formData.activo ?? true,
        [field]: value,
      };
      const parsed = UsuarioSchema.safeParse(dataToValidate);
      if (!parsed.success) {
        const flat = parsed.error.flatten().fieldErrors;
        const fieldError = flat[field as keyof typeof flat];
        if (fieldError && fieldError.length > 0) {
          return String(fieldError[0]);
        }
      }
      return "";
    } catch {
      return "";
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field] || value !== "") {
      const err = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: err }));
    }
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleFieldBlur = (field: string, value: any) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const err = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: err }));
  };

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
              <p className="text-xs text-muted-foreground">Nombres y apellidos del usuario</p>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleFieldChange("nombre", e.target.value)}
                onBlur={(e) => handleFieldBlur("nombre", e.target.value)}
                placeholder="Juan Pérez"
                disabled={isSubmitting || !allowEdit}
                required
                className={getInputClassName(errors, touched, "nombre", formData.nombre)}
              />
              <FieldFeedback
                error={errors.nombre}
                touched={touched.nombre}
                isValid={!errors.nombre && !!formData.nombre}
                successMessage="Nombre válido"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <p className="text-xs text-muted-foreground">Correo para inicio de sesión</p>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                onBlur={(e) => handleFieldBlur("email", e.target.value)}
                placeholder="juan@bananerashg.com"
                disabled={isSubmitting || !allowEdit}
                required
                className={getInputClassName(errors, touched, "email", formData.email)}
              />
              <FieldFeedback
                error={errors.email}
                touched={touched.email}
                isValid={!errors.email && !!formData.email}
                successMessage="Email válido"
              />
            </div>

            {!usuario && (
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleFieldChange("password", e.target.value)}
                    onBlur={(e) => handleFieldBlur("password", e.target.value)}
                    placeholder="Dejar vacío para contraseña por defecto"
                    disabled={isSubmitting || !allowEdit}
                    className={getInputClassName(errors, touched, "password", formData.password)}
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
              <p className="text-xs text-muted-foreground">Número de contacto</p>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => handleFieldChange("telefono", e.target.value)}
                onBlur={(e) => handleFieldBlur("telefono", e.target.value)}
                placeholder="0999999999"
                disabled={isSubmitting || !allowEdit}
                className={getInputClassName(errors, touched, "telefono", formData.telefono)}
              />
              <FieldFeedback
                error={errors.telefono}
                touched={touched.telefono}
                isValid={!errors.telefono && !!formData.telefono}
                successMessage="Teléfono válido"
                infoMessage={!touched.telefono ? "Formato: 09XXXXXXXX o 07XXXXXXX" : undefined}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rol">Rol *</Label>
              <p className="text-xs text-muted-foreground">Nivel de permisos en el sistema</p>
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
              <p className="text-xs text-muted-foreground">Finca donde puede operar</p>
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
              <p className="text-xs text-muted-foreground">¿Puede acceder al sistema?</p>
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
