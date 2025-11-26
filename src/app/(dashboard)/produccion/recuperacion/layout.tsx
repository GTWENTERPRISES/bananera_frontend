import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Producción - Recuperación",
  description: "Recuperación de cintas y barrida final",
  alternates: { canonical: "/produccion/recuperacion" },
  openGraph: { title: "Producción - Recuperación", description: "Recuperación de cintas y barrida final" },
  twitter: { title: "Producción - Recuperación", description: "Recuperación de cintas y barrida final", card: "summary" },
  robots: { index: true, follow: true },
};

export default function ProduccionRecuperacionLayout({ children }: { children: React.ReactNode }) {
  return children;
}