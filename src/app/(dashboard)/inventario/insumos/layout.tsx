import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inventario - Insumos",
  description: "Listado y registro de insumos",
  alternates: { canonical: "/inventario/insumos" },
  openGraph: { title: "Inventario - Insumos", description: "Listado y registro de insumos" },
  twitter: { title: "Inventario - Insumos", description: "Listado y registro de insumos", card: "summary" },
  robots: { index: true, follow: true },
};

export default function InventarioInsumosLayout({ children }: { children: React.ReactNode }) {
  return children;
}