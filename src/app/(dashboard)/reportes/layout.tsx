import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reportes",
  description: "Reportes financieros y de producción",
  alternates: { canonical: "/reportes" },
  openGraph: { title: "Reportes", description: "Reportes financieros y de producción" },
  twitter: { title: "Reportes", description: "Reportes financieros y de producción", card: "summary" },
  robots: { index: true, follow: true },
};

export default function ReportesLayout({ children }: { children: React.ReactNode }) {
  return children;
}