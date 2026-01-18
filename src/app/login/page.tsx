"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/src/hooks/useApp";
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft, Mail, KeyRound, Lock } from "lucide-react"
import { Alert, AlertDescription } from "@/src/components/ui/alert"
import { LoginSchema } from "@/src/lib/validation"
import { FieldFeedback, getInputClassName } from "@/src/components/ui/field-feedback"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

type ResetStep = 'login' | 'request' | 'verify' | 'reset' | 'success';

export default function LoginPage() {
  const router = useRouter()
  const { login } = useApp()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(false)
  
  // Password reset states
  const [resetStep, setResetStep] = useState<ResetStep>('login')
  const [resetEmail, setResetEmail] = useState("")
  const [resetCode, setResetCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [resetMessage, setResetMessage] = useState("")
  const [resetError, setResetError] = useState("")

  const validateField = (field: "email" | "password", value: string): string => {
    const data = { email, password, [field]: value };
    const parsed = LoginSchema.safeParse(data);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      const fieldError = flat[field];
      if (fieldError && fieldError.length > 0) {
        return String(fieldError[0]);
      }
    }
    return "";
  };

  const handleFieldChange = (field: "email" | "password", value: string) => {
    if (field === "email") setEmail(value);
    else setPassword(value);
    
    if (touched[field] || value !== "") {
      const err = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: err }));
    }
    setTouched(prev => ({ ...prev, [field]: true }));
    if (error) setError("");
  };

  const handleFieldBlur = (field: "email" | "password", value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const err = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: err }));
  };

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

  // Password Reset Functions
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError("")
    setResetMessage("")
    setIsLoading(true)

    try {
      const res = await fetch(`${API_URL}/password-reset/request/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      })
      const data = await res.json()
      
      if (res.ok) {
        setResetMessage(data.message || "Si el email existe, recibirás un código")
        setResetStep('verify')
      } else {
        setResetError(data.error || "Error al enviar código")
      }
    } catch {
      setResetError("Error de conexión con el servidor")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError("")
    setIsLoading(true)

    try {
      const res = await fetch(`${API_URL}/password-reset/verify/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, codigo: resetCode }),
      })
      const data = await res.json()
      
      if (res.ok && data.valid) {
        setResetStep('reset')
      } else {
        setResetError(data.error || "Código inválido o expirado")
      }
    } catch {
      setResetError("Error de conexión con el servidor")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError("")

    if (newPassword !== confirmPassword) {
      setResetError("Las contraseñas no coinciden")
      return
    }
    if (newPassword.length < 6) {
      setResetError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch(`${API_URL}/password-reset/confirm/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: resetEmail, 
          codigo: resetCode, 
          new_password: newPassword 
        }),
      })
      const data = await res.json()
      
      if (res.ok) {
        setResetStep('success')
      } else {
        setResetError(data.error || "Error al cambiar contraseña")
      }
    } catch {
      setResetError("Error de conexión con el servidor")
    } finally {
      setIsLoading(false)
    }
  }

  const resetToLogin = () => {
    setResetStep('login')
    setResetEmail("")
    setResetCode("")
    setNewPassword("")
    setConfirmPassword("")
    setResetError("")
    setResetMessage("")
  }

  // Password Reset UI
  if (resetStep !== 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                {resetStep === 'request' && <Mail className="h-8 w-8 text-primary-foreground" />}
                {resetStep === 'verify' && <KeyRound className="h-8 w-8 text-primary-foreground" />}
                {resetStep === 'reset' && <Lock className="h-8 w-8 text-primary-foreground" />}
                {resetStep === 'success' && <CheckCircle2 className="h-8 w-8 text-primary-foreground" />}
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              {resetStep === 'request' && "Recuperar Contraseña"}
              {resetStep === 'verify' && "Verificar Código"}
              {resetStep === 'reset' && "Nueva Contraseña"}
              {resetStep === 'success' && "¡Contraseña Actualizada!"}
            </CardTitle>
            <CardDescription>
              {resetStep === 'request' && "Ingresa tu correo para recibir un código"}
              {resetStep === 'verify' && "Ingresa el código de 6 dígitos enviado a tu correo"}
              {resetStep === 'reset' && "Crea una nueva contraseña segura"}
              {resetStep === 'success' && "Ya puedes iniciar sesión con tu nueva contraseña"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resetStep === 'request' && (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetEmail">Correo electrónico</Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    placeholder="usuario@bananerahg.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                {resetError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{resetError}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Enviar Código
                </Button>
              </form>
            )}

            {resetStep === 'verify' && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                {resetMessage && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription>{resetMessage}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="resetCode">Código de verificación</Label>
                  <Input
                    id="resetCode"
                    type="text"
                    placeholder="123456"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    disabled={isLoading}
                    className="text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Revisa tu bandeja de entrada y spam
                  </p>
                </div>
                {resetError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{resetError}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={isLoading || resetCode.length !== 6}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Verificar Código
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => { setResetStep('request'); setResetCode(""); setResetError(""); }}
                >
                  Reenviar código
                </Button>
              </form>
            )}

            {resetStep === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva contraseña</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                {resetError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{resetError}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Cambiar Contraseña
                </Button>
              </form>
            )}

            {resetStep === 'success' && (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    Tu contraseña ha sido actualizada correctamente.
                  </AlertDescription>
                </Alert>
                <Button className="w-full" onClick={resetToLogin}>
                  Ir a Iniciar Sesión
                </Button>
              </div>
            )}

            {resetStep !== 'success' && (
              <Button 
                type="button" 
                variant="link" 
                className="w-full mt-4"
                onClick={resetToLogin}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio de sesión
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
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
                onChange={(e) => handleFieldChange("email", e.target.value)}
                onBlur={(e) => handleFieldBlur("email", e.target.value)}
                required
                disabled={isLoading}
                className={getInputClassName(errors, touched, "email", email)}
              />
              <FieldFeedback
                error={errors.email}
                touched={touched.email}
                isValid={!errors.email && !!email}
                successMessage="Email válido"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => handleFieldChange("password", e.target.value)}
                onBlur={(e) => handleFieldBlur("password", e.target.value)}
                required
                disabled={isLoading}
                className={getInputClassName(errors, touched, "password", password)}
              />
              <FieldFeedback
                error={errors.password}
                touched={touched.password}
                isValid={!errors.password && password.length >= 6}
                successMessage="Contraseña válida"
                infoMessage={!touched.password ? "Mínimo 6 caracteres" : undefined}
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

            <Button 
              type="button" 
              variant="link" 
              className="w-full text-sm"
              onClick={() => setResetStep('request')}
            >
              ¿Olvidaste tu contraseña?
            </Button>
          </form>

          <div className="mt-4 p-4 bg-muted rounded-lg">
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
