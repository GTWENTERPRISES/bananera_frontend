"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useIsMobile } from "@/src/hooks/use-mobile";

// Definir el tipo para el contexto
interface ResponsiveContextType {
  isMobile: boolean;
  isDesktop: boolean;
}

// Crear el contexto
const ResponsiveContext = createContext<ResponsiveContextType | undefined>(undefined);

// Proveedor del contexto
export function ResponsiveProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  
  // Aplicar clases CSS globales basadas en el tamaño de pantalla
  useEffect(() => {
    const htmlElement = document.documentElement;
    
    if (isMobile) {
      htmlElement.classList.add('is-mobile');
      htmlElement.classList.remove('is-desktop');
    } else {
      htmlElement.classList.add('is-desktop');
      htmlElement.classList.remove('is-mobile');
    }
    
    // Establecer variables CSS personalizadas para dimensiones responsivas
    htmlElement.style.setProperty('--responsive-padding', isMobile ? '0.75rem' : '1.5rem');
    htmlElement.style.setProperty('--responsive-gap', isMobile ? '0.5rem' : '1rem');
    htmlElement.style.setProperty('--responsive-font-size', isMobile ? '0.875rem' : '1rem');
    htmlElement.style.setProperty('--responsive-heading-size', isMobile ? '1.25rem' : '1.5rem');
    htmlElement.style.setProperty('--responsive-chart-height', isMobile ? '200px' : '300px');
    
    return () => {
      // Limpiar clases y variables al desmontar
      htmlElement.classList.remove('is-mobile', 'is-desktop');
      htmlElement.style.removeProperty('--responsive-padding');
      htmlElement.style.removeProperty('--responsive-gap');
      htmlElement.style.removeProperty('--responsive-font-size');
      htmlElement.style.removeProperty('--responsive-heading-size');
      htmlElement.style.removeProperty('--responsive-chart-height');
    };
  }, [isMobile]);
  
  return (
    <ResponsiveContext.Provider value={{ isMobile, isDesktop: !isMobile }}>
      {children}
    </ResponsiveContext.Provider>
  );
}

// Hook para usar el contexto
export function useResponsive() {
  const context = useContext(ResponsiveContext);
  
  if (context === undefined) {
    throw new Error("useResponsive debe ser usado dentro de un ResponsiveProvider");
  }
  
  return context;
}