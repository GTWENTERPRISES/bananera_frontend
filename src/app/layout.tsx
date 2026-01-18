import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/src/contexts/app-context";
import { ResponsiveProvider } from "@/src/contexts/responsive-context";
import { ThemeProvider } from "@/src/components/theme-provider";
import { RouteProgress } from "@/src/components/layout/route-progress";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Bananera HG - Sistema de Gestión",
    template: "%s | Bananera HG",
  },
  description: "Sistema integral de gestión operacional para Bananera HG",
  applicationName: "Bananera HG",
  authors: [{ name: "Bananera HG" }],
  creator: "Bananera HG",
  publisher: "Bananera HG",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Bananera HG - Sistema de Gestión",
    siteName: "Bananera HG",
    description: "Sistema integral de gestión operacional para Bananera HG",
    locale: "es_ES",
  },
  twitter: {
    card: "summary",
    title: "Bananera HG - Sistema de Gestión",
    description: "Sistema integral de gestión operacional para Bananera HG",
  },
  icons: {
    icon: [{ url: "/favicon.ico" }],
    shortcut: ["/favicon.ico"],
  },
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ResponsiveProvider>
            <AppProvider>
              <RouteProgress />
              {children}
            </AppProvider>
          </ResponsiveProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
