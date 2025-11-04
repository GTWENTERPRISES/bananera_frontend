import { useIsMobile } from './use-mobile';

export function useResponsive() {
  const isMobile = useIsMobile();
  
  return {
    isMobile,
    isDesktop: !isMobile,
    
    // Clases CSS condicionales basadas en el tamaño de pantalla
    classes: {
      // Contenedores
      container: isMobile ? 'p-3' : 'p-6',
      card: isMobile ? 'p-3' : 'p-5',
      
      // Grids
      grid: isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 md:grid-cols-3 gap-6',
      formGrid: isMobile ? 'flex flex-col gap-3' : 'grid grid-cols-2 gap-4',
      
      // Tamaños de texto
      heading: isMobile ? 'text-xl' : 'text-2xl',
      subheading: isMobile ? 'text-lg' : 'text-xl',
      text: isMobile ? 'text-sm' : 'text-base',
      
      // Espaciado
      spacing: isMobile ? 'space-y-3' : 'space-y-6',
      
      // Visibilidad
      mobileOnly: isMobile ? 'block' : 'hidden',
      desktopOnly: isMobile ? 'hidden' : 'block',
    },
    
    // Dimensiones responsivas para gráficos y componentes
    dimensions: {
      chartHeight: isMobile ? 200 : 300,
      modalWidth: isMobile ? '95%' : '70%',
      sidebarWidth: isMobile ? '100%' : '250px',
    }
  };
}