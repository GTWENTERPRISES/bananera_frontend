import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inventario - Movimientos",
  description: "Entrada y salida de insumos",
  alternates: { canonical: "/inventario/movimientos" },
  openGraph: { title: "Inventario - Movimientos", description: "Entrada y salida de insumos" },
  twitter: { title: "Inventario - Movimientos", description: "Entrada y salida de insumos", card: "summary" },
  robots: { index: true, follow: true },
};

export default function InventarioMovimientosLayout({ children }: { children: React.ReactNode }) {
  return children;
}