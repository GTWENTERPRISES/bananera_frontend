import { useIsMobile } from './use-mobile';
import { useEffect } from 'react';

/**
 * Hook global para aplicar responsividad a toda la aplicación
 * Este hook añade clases CSS al elemento html para controlar la responsividad
 * de manera global sin tener que modificar cada componente individualmente
 */
export function useGlobalResponsive() {
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Añadir clase al elemento html para controlar estilos responsivos globalmente
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
  
  return { isMobile };
}