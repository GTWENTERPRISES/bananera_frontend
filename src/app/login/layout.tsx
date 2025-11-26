import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede al sistema de gestión de Bananera HG",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: false },
  openGraph: { title: "Iniciar sesión", description: "Accede al sistema de gestión de Bananera HG" },
  twitter: { title: "Iniciar sesión", description: "Accede al sistema de gestión de Bananera HG", card: "summary" },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}