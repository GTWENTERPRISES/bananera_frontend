"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Label } from "@/src/components/ui/label";
import { useApp } from "@/src/contexts/app-context";
import { useToast } from "@/src/hooks/use-toast";
import { isValidEcuadorPhone } from "@/src/lib/validation";

export default function PerfilPage() {
  const { currentUser, setCurrentUser } = useApp();
  const { toast } = useToast();
  const [nombre, setNombre] = useState(currentUser?.nombre || "");
  const [telefono, setTelefono] = useState(currentUser?.telefono || "");
  const [avatar, setAvatar] = useState(currentUser?.avatar || "");

  const save = () => {
    if (!currentUser) return;
    if (!nombre.trim()) {
      toast({ title: "Nombre requerido", description: "Ingresa tu nombre", variant: "destructive" });
      return;
    }
    if (telefono && !isValidEcuadorPhone(telefono)) {
      toast({ title: "Teléfono inválido", description: "Debe ser un número de Ecuador", variant: "destructive" });
      return;
    }
    setCurrentUser({ ...currentUser, nombre, telefono, avatar });
    toast({ title: "Perfil actualizado", description: "Tus cambios se guardaron correctamente" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mi Perfil</h2>
        <p className="text-muted-foreground">Información de la cuenta y ajustes personales</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Usuario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatar || "/placeholder.svg"} />
              <AvatarFallback>{(currentUser?.nombre || "").slice(0,1)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">Rol</p>
              <p className="capitalize font-medium">{currentUser?.rol}</p>
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
              <Input id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input id="avatar" value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://..." />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={save}>Guardar Cambios</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
