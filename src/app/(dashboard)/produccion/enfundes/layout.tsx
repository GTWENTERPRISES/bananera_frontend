import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Producción - Enfundes",
  description: "Registro de enfundes y control de calibración",
  alternates: { canonical: "/produccion/enfundes" },
  openGraph: { title: "Producción - Enfundes", description: "Registro de enfundes y control de calibración" },
  twitter: { title: "Producción - Enfundes", description: "Registro de enfundes y control de calibración", card: "summary" },
  robots: { index: true, follow: true },
};

export default function ProduccionEnfundesLayout({ children }: { children: React.ReactNode }) {
  return children;
}