import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Producción",
  description: "Gestión de cosechas, enfundes y recuperación de cintas",
  alternates: { canonical: "/produccion" },
  openGraph: { title: "Producción", description: "Gestión de cosechas, enfundes y recuperación de cintas" },
  twitter: { title: "Producción", description: "Gestión de cosechas, enfundes y recuperación de cintas", card: "summary" },
  robots: { index: true, follow: true },
};

export default function ProduccionLayout({ children }: { children: React.ReactNode }) {
  return children;
}