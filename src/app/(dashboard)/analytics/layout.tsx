import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Análisis y tendencias de producción y calidad",
  alternates: { canonical: "/analytics" },
  openGraph: { title: "Analytics", description: "Análisis y tendencias de producción y calidad" },
  twitter: { title: "Analytics", description: "Análisis y tendencias de producción y calidad", card: "summary" },
  robots: { index: true, follow: true },
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return children;
}