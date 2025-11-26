import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perfil",
  description: "Información y preferencias del usuario",
  alternates: { canonical: "/perfil" },
  openGraph: { title: "Perfil", description: "Información y preferencias del usuario" },
  twitter: { title: "Perfil", description: "Información y preferencias del usuario", card: "summary" },
  robots: { index: false, follow: false },
};

export default function PerfilLayout({ children }: { children: React.ReactNode }) {
  return children;
}