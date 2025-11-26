import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configuración",
  description: "Gestión de usuarios, permisos y fincas",
  alternates: { canonical: "/configuracion" },
  openGraph: { title: "Configuración", description: "Gestión de usuarios, permisos y fincas" },
  twitter: { title: "Configuración", description: "Gestión de usuarios, permisos y fincas", card: "summary" },
  robots: { index: true, follow: true },
};

export default function ConfiguracionLayout({ children }: { children: React.ReactNode }) {
  return children;
}