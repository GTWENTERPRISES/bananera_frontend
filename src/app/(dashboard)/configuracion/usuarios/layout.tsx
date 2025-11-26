import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Usuarios",
  description: "Gestión de usuarios y asignaciones",
  alternates: { canonical: "/configuracion/usuarios" },
  openGraph: { title: "Usuarios", description: "Gestión de usuarios y asignaciones" },
  twitter: { title: "Usuarios", description: "Gestión de usuarios y asignaciones", card: "summary" },
  robots: { index: true, follow: true },
};

export default function UsuariosLayout({ children }: { children: React.ReactNode }) {
  return children;
}