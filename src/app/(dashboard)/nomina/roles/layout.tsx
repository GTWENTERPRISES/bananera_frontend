import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nómina - Roles de Pago",
  description: "Generación y revisión de roles de pago",
  alternates: { canonical: "/nomina/roles" },
  openGraph: { title: "Nómina - Roles de Pago", description: "Generación y revisión de roles de pago" },
  twitter: { title: "Nómina - Roles de Pago", description: "Generación y revisión de roles de pago", card: "summary" },
  robots: { index: true, follow: true },
};

export default function NominaRolesLayout({ children }: { children: React.ReactNode }) {
  return children;
}