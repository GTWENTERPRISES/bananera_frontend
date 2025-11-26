"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/src/hooks/useApp";
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/src/components/ui/alert"
import { LoginSchema } from "@/src/lib/validation"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useApp()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const parsed = LoginSchema.safeParse({ email, password })
      if (!parsed.success) {
        setError(parsed.error.errors[0]?.message || "Datos inválidos")
        return
      }
      const result = await login(email, password)

      if (result.success) {
        router.push("/dashboard")
      } else {
        setError(result.message || "Error al iniciar sesión")
      }
    } catch (err) {
      setError("Error inesperado. Intente nuevamente")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">HG</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Bananera HG</CardTitle>
          <CardDescription>Sistema de Gestión Operacional</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@bananerahg.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Usuarios de prueba:</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>
                <strong>Administrador:</strong> admin@bananerahg.com / admin123
              </p>
              <p>
                <strong>Gerente:</strong> gerente@bananerahg.com / gerente123
              </p>
              <p>
                <strong>Supervisor Finca:</strong> supervisor@bananerahg.com / supervisor123
              </p>
              <p>
                <strong>Contador/RRHH:</strong> rrhh@bananerahg.com / rrhh123
              </p>
              <p>
                <strong>Bodeguero:</strong> bodega@bananerahg.com / bodega123
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
