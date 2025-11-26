import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nómina - Empleados",
  description: "Listado y registro de empleados",
  alternates: { canonical: "/nomina/empleados" },
  openGraph: { title: "Nómina - Empleados", description: "Listado y registro de empleados" },
  twitter: { title: "Nómina - Empleados", description: "Listado y registro de empleados", card: "summary" },
  robots: { index: true, follow: true },
};

export default function NominaEmpleadosLayout({ children }: { children: React.ReactNode }) {
  return children;
}