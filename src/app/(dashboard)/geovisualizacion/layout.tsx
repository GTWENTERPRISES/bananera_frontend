import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Geovisualización",
  description: "Mapa y análisis espacial de fincas",
  alternates: { canonical: "/geovisualizacion" },
  openGraph: { title: "Geovisualización", description: "Mapa y análisis espacial de fincas" },
  twitter: { title: "Geovisualización", description: "Mapa y análisis espacial de fincas", card: "summary" },
  robots: { index: true, follow: true },
};

export default function GeovisLayout({ children }: { children: React.ReactNode }) {
  return children;
}