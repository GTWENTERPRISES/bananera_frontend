import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nómina - Préstamos",
  description: "Registro y gestión de préstamos de empleados",
  alternates: { canonical: "/nomina/prestamos" },
  openGraph: { title: "Nómina - Préstamos", description: "Registro y gestión de préstamos de empleados" },
  twitter: { title: "Nómina - Préstamos", description: "Registro y gestión de préstamos de empleados", card: "summary" },
  robots: { index: true, follow: true },
};

export default function NominaPrestamosLayout({ children }: { children: React.ReactNode }) {
  return children;
}