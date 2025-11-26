import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fincas",
  description: "Administración de fincas y características",
  alternates: { canonical: "/configuracion/fincas" },
  openGraph: { title: "Fincas", description: "Administración de fincas y características" },
  twitter: { title: "Fincas", description: "Administración de fincas y características", card: "summary" },
  robots: { index: true, follow: true },
};

export default function FincasLayout({ children }: { children: React.ReactNode }) {
  return children;
}