"use client";

import { useState } from "react";
import { useApp } from "@/src/contexts/app-context";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { UsuarioForm } from "@/src/components/configuracion/usuario-form";
import { UsuariosTable } from "@/src/components/configuracion/usuarios-table";
import type { User } from "@/src/lib/types";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";

export default function UsuariosPage() {
  const { state, addUsuario, updateUsuario, deleteUsuario, canAccess } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<User | undefined>();

  const handleSave = (usuarioData: Partial<User>) => {
    try {
      if (editingUsuario) {
        // Actualizar usuario existente
        updateUsuario(editingUsuario.id, usuarioData);
        toast.success("Usuario actualizado correctamente");
      } else {
        // Crear nuevo usuario
        const newUsuario: User = {
          id: Date.now().toString(), // Generar ID único
          nombre: usuarioData.nombre || "",
          email: usuarioData.email || "",
          password: usuarioData.password || "123456", // Contraseña por defecto
          rol: usuarioData.rol || "bodeguero",
          activo: usuarioData.activo ?? true,
          telefono: usuarioData.telefono,
          fincaAsignada: usuarioData.fincaAsignada,
          avatar: usuarioData.avatar,
        };
        addUsuario(newUsuario);
        toast.success("Usuario creado correctamente");
      }

      setShowForm(false);
      setEditingUsuario(undefined);
    } catch (error) {
      console.error("Error al guardar usuario:", error);
      toast.error("Error al guardar el usuario");
    }
  };

  const handleEdit = (usuario: User) => {
    setEditingUsuario(usuario);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    try {
      // Verificar que no sea el usuario actual
      if (state.currentUser?.id === id) {
        toast.error("No puedes eliminar tu propio usuario");
        return;
      }

      // Verificar que no sea el único administrador activo
      const administradoresActivos = state.usuarios.filter(
        (u) => u.rol === "administrador" && u.activo && u.id !== id
      );

      if (administradoresActivos.length === 0) {
        toast.error("No se puede eliminar el único administrador activo");
        return;
      }

      // Eliminar usuario
      deleteUsuario(id);
      toast.success("Usuario eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      toast.error("Error al eliminar el usuario");
    }
  };

  const handleToggleStatus = (id: string, activo: boolean) => {
    try {
      // Verificar que no sea el usuario actual
      if (state.currentUser?.id === id) {
        toast.error("No puedes desactivar tu propio usuario");
        return;
      }

      // Verificar que no sea el único administrador activo
      if (!activo) {
        const usuario = state.usuarios.find((u) => u.id === id);
        if (usuario?.rol === "administrador") {
          const administradoresActivos = state.usuarios.filter(
            (u) => u.rol === "administrador" && u.activo && u.id !== id
          );

          if (administradoresActivos.length === 0) {
            toast.error("No se puede desactivar el único administrador activo");
            return;
          }
        }
      }

      // Actualizar estado del usuario
      updateUsuario(id, { activo });
      toast.success(
        `Usuario ${activo ? "activado" : "desactivado"} correctamente`
      );
    } catch (error) {
      console.error("Error al cambiar estado del usuario:", error);
      toast.error("Error al cambiar el estado del usuario");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUsuario(undefined);
  };

  const handleNewUser = () => {
    setEditingUsuario(undefined);
    setShowForm(true);
  };

  // Verificar permisos del usuario actual
  const canManageUsers = canAccess("configuracion", "edit");
  const canDeleteUsers = canAccess("configuracion", "edit");

  if (!canManageUsers) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Gestión de Usuarios
            </h1>
            <p className="text-muted-foreground">
              Administra los usuarios y sus permisos en el sistema
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Acceso denegado</h3>
              <p className="text-muted-foreground">
                No tienes permisos para gestionar usuarios. Contacta al
                administrador del sistema.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestión de Usuarios
          </h1>
          <p className="text-muted-foreground">
            Administra los usuarios y sus permisos en el sistema
          </p>
        </div>
        {!showForm && canManageUsers && (
          <Button onClick={handleNewUser}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        )}
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">
              {state.usuarios.length}
            </div>
            <p className="text-sm text-muted-foreground">Total Usuarios</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {state.usuarios.filter((u) => u.activo).length}
            </div>
            <p className="text-sm text-muted-foreground">Usuarios Activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {state.usuarios.filter((u) => u.rol === "administrador").length}
            </div>
            <p className="text-sm text-muted-foreground">Administradores</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {state.usuarios.filter((u) => u.rol === "bodeguero").length}
            </div>
            <p className="text-sm text-muted-foreground">Bodegueros</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuarios Registrados
            </CardTitle>
            <CardDescription>
              Total de usuarios: {state.usuarios.length} | Activos:{" "}
              {state.usuarios.filter((u) => u.activo).length} | Administradores:{" "}
              {state.usuarios.filter((u) => u.rol === "administrador").length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showForm ? (
              <UsuarioForm
                usuario={editingUsuario}
                onSave={handleSave}
                onCancel={handleCancel}
                fincas={state.fincas}
                currentUserRole={state.currentUser?.rol}
              />
            ) : (
              <UsuariosTable
                usuarios={state.usuarios}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                currentUserId={state.currentUser?.id}
                canDeleteUsers={canDeleteUsers}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
