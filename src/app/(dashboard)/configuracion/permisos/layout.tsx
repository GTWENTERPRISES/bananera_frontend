import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Permisos",
  description: "Control de permisos y roles de acceso",
  alternates: { canonical: "/configuracion/permisos" },
  openGraph: { title: "Permisos", description: "Control de permisos y roles de acceso" },
  twitter: { title: "Permisos", description: "Control de permisos y roles de acceso", card: "summary" },
  robots: { index: true, follow: true },
};

export default function PermisosLayout({ children }: { children: React.ReactNode }) {
  return children;
}