import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inventario",
  description: "Gestión de insumos, movimientos y alertas",
  alternates: { canonical: "/inventario" },
  openGraph: { title: "Inventario", description: "Gestión de insumos, movimientos y alertas" },
  twitter: { title: "Inventario", description: "Gestión de insumos, movimientos y alertas", card: "summary" },
  robots: { index: true, follow: true },
};

export default function InventarioLayout({ children }: { children: React.ReactNode }) {
  return children;
}