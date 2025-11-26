import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Resumen operacional y KPIs de Bananera HG",
  alternates: { canonical: "/dashboard" },
  openGraph: {
    title: "Dashboard",
    description: "Resumen operacional y KPIs de Bananera HG",
  },
  twitter: {
    title: "Dashboard",
    description: "Resumen operacional y KPIs de Bananera HG",
    card: "summary",
  },
  robots: { index: true, follow: true },
};

export default function DashboardSectionLayout({ children }: { children: React.ReactNode }) {
  return children;
}