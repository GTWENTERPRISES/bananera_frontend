import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reportes - Producción",
  description: "Reportes de cosechas, enfundes y calidad",
  alternates: { canonical: "/reportes/produccion" },
  openGraph: { title: "Reportes - Producción", description: "Reportes de cosechas, enfundes y calidad" },
  twitter: { title: "Reportes - Producción", description: "Reportes de cosechas, enfundes y calidad", card: "summary" },
  robots: { index: true, follow: true },
};

export default function ReportesProduccionLayout({ children }: { children: React.ReactNode }) {
  return children;
}