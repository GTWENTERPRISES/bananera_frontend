import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Producción - Cosechas",
  description: "Registro y análisis de cosechas",
  alternates: { canonical: "/produccion/cosechas" },
  openGraph: { title: "Producción - Cosechas", description: "Registro y análisis de cosechas" },
  twitter: { title: "Producción - Cosechas", description: "Registro y análisis de cosechas", card: "summary" },
  robots: { index: true, follow: true },
};

export default function ProduccionCosechasLayout({ children }: { children: React.ReactNode }) {
  return children;
}