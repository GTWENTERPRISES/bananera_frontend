"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/src/hooks/useApp";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, currentUser } = useApp();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // Verificar localStorage directamente primero
      const savedUser = localStorage.getItem("currentUser");

      if (!savedUser) {
        router.push("/login");
        return;
      }

      // Si hay usuario en localStorage pero no en el contexto, esperar un momento
      if (!isAuthenticated && !currentUser) {
        // Dar tiempo a que el contexto se inicialice
        const timeout = setTimeout(() => {
          if (!isAuthenticated && !currentUser) {
            router.push("/login");
          } else {
            setIsChecking(false);
          }
        }, 1000);

        return () => clearTimeout(timeout);
      } else {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [isAuthenticated, currentUser, router]);

  // Si estamos verificando, mostrar loader
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Si no está autenticado, no renderizar nada (ya se redirigió)
  if (!isAuthenticated && !currentUser) {
    return null;
  }

  return <>{children}</>;
}
