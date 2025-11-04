"use client";

import { useIsMobile } from "./use-mobile";

/**
 * Hook para aplicar clases responsivas a componentes
 * @returns Objeto con funciones y clases para aplicar estilos responsivos
 */
export function useResponsiveClasses() {
  const isMobile = useIsMobile();
  
  // Función para aplicar clases condicionales basadas en el estado móvil
  const getResponsiveClass = (baseClass: string, mobileClass: string, desktopClass: string) => {
    return `${baseClass} ${isMobile ? mobileClass : desktopClass}`;
  };
  
  // Clases predefinidas para componentes comunes
  const classes = {
    // Contenedores
    container: getResponsiveClass("w-full", "px-4", "px-6"),
    
    // Tablas
    table: "responsive-table",
    tableSm: "responsive-table responsive-table-sm",
    tableMd: "responsive-table responsive-table-md",
    
    // Tarjetas
    card: getResponsiveClass("responsive-card", "p-4", "p-6"),
    
    // Gráficos
    chart: "responsive-chart",
    
    // Formularios
    form: "responsive-form",
    formRow: getResponsiveClass("flex gap-4", "flex-col", "flex-row"),
    
    // Grids
    grid: "responsive-grid",
    
    // Visibilidad
    hideOnMobile: isMobile ? "hide-on-mobile" : "",
    showOnMobile: isMobile ? "" : "show-on-mobile",
  };
  
  return {
    isMobile,
    getResponsiveClass,
    classes,
  };
}