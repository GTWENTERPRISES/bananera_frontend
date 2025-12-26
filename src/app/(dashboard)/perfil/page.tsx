"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Label } from "@/src/components/ui/label";
import { useApp } from "@/src/contexts/app-context";
import { useToast } from "@/src/hooks/use-toast";
import { isValidEcuadorPhone, UsuarioSchema } from "@/src/lib/validation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";
import { Badge } from "@/src/components/ui/badge";

export default function PerfilPage() {
  const { currentUser, setCurrentUser, updateUsuario } = useApp();
  const { toast } = useToast();
  const [nombre, setNombre] = useState(currentUser?.nombre || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [telefono, setTelefono] = useState(currentUser?.telefono || "");
  const [avatar, setAvatar] = useState(currentUser?.avatar || "");
  const [password, setPassword] = useState("");
  const [avatarFileName, setAvatarFileName] = useState<string>("");

  const save = () => {
    if (!currentUser) return;
    try {
      const validated = UsuarioSchema.parse({
        nombre,
        email,
        password: password || undefined,
        rol: currentUser.rol,
        fincaAsignada: currentUser.fincaAsignada,
        telefono,
        activo: currentUser.activo,
      });

      updateUsuario(currentUser.id, {
        nombre: validated.nombre,
        email: validated.email,
        telefono: validated.telefono,
        avatar,
        password: validated.password,
      });
      setCurrentUser({ ...currentUser, nombre: validated.nombre, email: validated.email, telefono: validated.telefono, avatar, password: validated.password || currentUser.password });
      toast({ title: "Perfil actualizado", description: "Tus cambios se guardaron correctamente" });
    } catch (err) {
      toast({ title: "Datos inválidos", description: "Verifica los campos ingresados", variant: "destructive" });
    }
  };

  const onAvatarFileChange = (file?: File) => {
    if (!file) return;
    setAvatarFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatar(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mi Perfil</h2>
        <p className="text-muted-foreground">Información de la cuenta y ajustes personales</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
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
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input id="avatar" value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://..." />
                <div className="flex items-center gap-2 mt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">Cambiar imagen</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Seleccionar imagen de perfil</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3">
                        <Input type="file" accept="image/*" onChange={(e) => onAvatarFileChange(e.target.files?.[0])} />
                        {avatarFileName && <p className="text-sm text-muted-foreground">{avatarFileName}</p>}
                        <div className="flex justify-end">
                          <Button onClick={() => toast({ title: "Imagen cargada", description: "Se actualizó la imagen de perfil" })}>Usar esta imagen</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="password">Contraseña (opcional)</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={save}>Guardar Cambios</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferencias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">Tema</p>
              <p className="text-xs text-muted-foreground">Configura el tema desde el botón de la barra superior</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">Notificaciones</p>
              <p className="text-xs text-muted-foreground">Las alertas del sistema aparecen en el ícono de campana</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
