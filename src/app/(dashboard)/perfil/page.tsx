"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Label } from "@/src/components/ui/label";
import { useApp } from "@/src/contexts/app-context";
import { useToast } from "@/src/hooks/use-toast";
import { UsuarioSchema } from "@/src/lib/validation";
import { Badge } from "@/src/components/ui/badge";

export default function PerfilPage() {
  const { currentUser, setCurrentUser, updateUsuario } = useApp();
  const { toast } = useToast();
  const [nombre, setNombre] = useState(currentUser?.nombre || "");
  const [telefono, setTelefono] = useState(currentUser?.telefono || "");
  const [password, setPassword] = useState("");

  const save = async () => {
    if (!currentUser) return;
    try {
      const validated = UsuarioSchema.parse({
        nombre,
        email: currentUser.email,
        password: password || undefined,
        rol: currentUser.rol,
        fincaAsignada: currentUser.fincaAsignada,
        telefono,
        activo: currentUser.activo,
      });

      // Actualizar en el backend
      await updateUsuario(currentUser.id, {
        nombre: validated.nombre,
        telefono: validated.telefono,
        password: validated.password,
      });
      
      // Actualizar localmente
      setCurrentUser({ 
        ...currentUser, 
        nombre: validated.nombre, 
        telefono: validated.telefono,
      });
      
      toast({ title: "Perfil actualizado", description: "Tus cambios se guardaron correctamente" });
      setPassword("");
    } catch (err) {
      console.error("Error guardando perfil:", err);
      toast({ 
        title: "Error al guardar", 
        description: "Verifica los campos ingresados", 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mi Perfil</h2>
        <p className="text-muted-foreground">Información de la cuenta y ajustes personales</p>
      </div>
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Información del Usuario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={currentUser?.avatar || "/placeholder.svg"} />
                <AvatarFallback>{(currentUser?.nombre || "").slice(0,1)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">{currentUser?.rol}</Badge>
                  {currentUser?.fincaAsignada && (
                    <Badge variant="outline">{currentUser.fincaAsignada}</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">Correo</p>
                <p className="font-medium">{currentUser?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="0999999999" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="password">Nueva Contraseña (opcional)</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Dejar vacío para mantener la actual" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={save}>Guardar Cambios</Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
