import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nómina",
  description: "Gestión de empleados, préstamos y roles de pago",
  alternates: { canonical: "/nomina" },
  openGraph: { title: "Nómina", description: "Gestión de empleados, préstamos y roles de pago" },
  twitter: { title: "Nómina", description: "Gestión de empleados, préstamos y roles de pago", card: "summary" },
  robots: { index: true, follow: true },
};

export default function NominaLayout({ children }: { children: React.ReactNode }) {
  return children;
}