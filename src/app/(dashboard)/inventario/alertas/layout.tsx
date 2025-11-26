import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inventario - Alertas",
  description: "Alertas de stock bajo y reposiciones sugeridas",
  alternates: { canonical: "/inventario/alertas" },
  openGraph: { title: "Inventario - Alertas", description: "Alertas de stock bajo y reposiciones sugeridas" },
  twitter: { title: "Inventario - Alertas", description: "Alertas de stock bajo y reposiciones sugeridas", card: "summary" },
  robots: { index: true, follow: true },
};

export default function InventarioAlertasLayout({ children }: { children: React.ReactNode }) {
  return children;
}