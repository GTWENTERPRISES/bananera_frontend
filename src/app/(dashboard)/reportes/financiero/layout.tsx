import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reportes - Financiero",
  description: "Reportes de costos, ingresos y egresos",
  alternates: { canonical: "/reportes/financiero" },
  openGraph: { title: "Reportes - Financiero", description: "Reportes de costos, ingresos y egresos" },
  twitter: { title: "Reportes - Financiero", description: "Reportes de costos, ingresos y egresos", card: "summary" },
  robots: { index: true, follow: true },
};

export default function ReportesFinancieroLayout({ children }: { children: React.ReactNode }) {
  return children;
}