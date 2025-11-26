import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics Predictivo",
  description: "Predicción de producción y riesgos con IA",
  alternates: { canonical: "/analytics/predictivo" },
  openGraph: { title: "Analytics Predictivo", description: "Predicción de producción y riesgos con IA" },
  twitter: { title: "Analytics Predictivo", description: "Predicción de producción y riesgos con IA", card: "summary" },
  robots: { index: true, follow: true },
};

export default function PredictivoLayout({ children }: { children: React.ReactNode }) {
  return children;
}