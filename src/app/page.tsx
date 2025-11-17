"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("currentUser");
      const target = savedUser ? "/dashboard" : "/login";
      // Usar replace para evitar historial y asegurar navegación inmediata
      router.replace(target);
    } catch (error) {
      // Fallback seguro: si algo falla al leer localStorage, enviar a /login
      router.replace("/login");
    }
  }, [router]);

  // Mostrar un loader mientras ocurre la redirección para evitar pantalla en blanco
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
