import { useIsMobile } from "@/src/hooks/use-mobile";

// Utilidades para aplicar estilos responsivos a componentes
export const responsiveUtils = {
  // Contenedores
  container: (isMobile: boolean) => isMobile ? "p-3" : "p-6",
  card: (isMobile: boolean) => isMobile ? "p-3" : "p-5",
  
  // Grids
  grid: (isMobile: boolean) => isMobile ? "grid-cols-1 gap-3" : "grid-cols-2 md:grid-cols-3 gap-6",
  formGrid: (isMobile: boolean) => isMobile ? "flex flex-col gap-3" : "grid grid-cols-2 gap-4",
  
  // Tamaños de texto
  heading: (isMobile: boolean) => isMobile ? "text-xl" : "text-2xl",
  subheading: (isMobile: boolean) => isMobile ? "text-lg" : "text-xl",
  text: (isMobile: boolean) => isMobile ? "text-sm" : "text-base",
  
  // Espaciado
  spacing: (isMobile: boolean) => isMobile ? "space-y-3" : "space-y-6",
  
  // Visibilidad
  mobileOnly: (isMobile: boolean) => isMobile ? "block" : "hidden",
  desktopOnly: (isMobile: boolean) => isMobile ? "hidden" : "block",
  
  // Dimensiones
  chartHeight: (isMobile: boolean) => isMobile ? 200 : 300,
  modalWidth: (isMobile: boolean) => isMobile ? "95%" : "70%",
  sidebarWidth: (isMobile: boolean) => isMobile ? "100%" : "250px",
  
  // Tablas
  tableContainer: "w-full overflow-x-auto",
  table: (isMobile: boolean) => isMobile ? "text-xs" : "text-sm",
  
  // Formularios
  form: (isMobile: boolean) => isMobile ? "space-y-3" : "space-y-4",
  formRow: (isMobile: boolean) => isMobile ? "flex flex-col gap-3" : "flex gap-4",
  formCol: "flex-1",
};

// Hook para usar utilidades responsivas
export function useResponsiveStyles() {
  const isMobile = useIsMobile();
  
  return {
    isMobile,
    isDesktop: !isMobile,
    styles: {
      container: responsiveUtils.container(isMobile),
      card: responsiveUtils.card(isMobile),
      grid: responsiveUtils.grid(isMobile),
      formGrid: responsiveUtils.formGrid(isMobile),
      heading: responsiveUtils.heading(isMobile),
      subheading: responsiveUtils.subheading(isMobile),
      text: responsiveUtils.text(isMobile),
      spacing: responsiveUtils.spacing(isMobile),
      mobileOnly: responsiveUtils.mobileOnly(isMobile),
      desktopOnly: responsiveUtils.desktopOnly(isMobile),
      chartHeight: responsiveUtils.chartHeight(isMobile),
      modalWidth: responsiveUtils.modalWidth(isMobile),
      sidebarWidth: responsiveUtils.sidebarWidth(isMobile),
      table: responsiveUtils.table(isMobile),
      form: responsiveUtils.form(isMobile),
      formRow: responsiveUtils.formRow(isMobile),
      formCol: responsiveUtils.formCol,
    }
  };
}