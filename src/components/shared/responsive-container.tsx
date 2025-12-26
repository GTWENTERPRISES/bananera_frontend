"use client";

import React from "react";
import { useIsMobile } from "@/src/hooks/use-mobile";
import { cn } from "@/src/lib/utils";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  desktopClassName?: string;
}

export function ResponsiveContainer({
  children,
  className = "",
  mobileClassName = "",
  desktopClassName = "",
}: ResponsiveContainerProps) {
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        className,
        isMobile ? mobileClassName : desktopClassName
      )}
    >
      {children}
    </div>
  );
}

export function ResponsiveGrid({
  children,
  className = "",
  cols = 1,
  mdCols = 2,
  lgCols = 3,
  gap = 4,
}: {
  children: React.ReactNode;
  className?: string;
  cols?: number;
  mdCols?: number;
  lgCols?: number;
  gap?: number;
}) {
  // Mapear números a clases estáticas de Tailwind para evitar interpolaciones dinámicas
  const colMap: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
  };

  const mdColMap: Record<number, string> = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-5",
    6: "md:grid-cols-6",
  };

  const lgColMap: Record<number, string> = {
    1: "lg:grid-cols-1",
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    5: "lg:grid-cols-5",
    6: "lg:grid-cols-6",
  };

  const gapMap: Record<number, string> = {
    0: "gap-0",
    1: "gap-1",
    2: "gap-2",
    3: "gap-3",
    4: "gap-4",
    5: "gap-5",
    6: "gap-6",
    8: "gap-8",
    10: "gap-10",
    12: "gap-12",
  };

  return (
    <div
      className={cn(
        "grid",
        colMap[cols] ?? "grid-cols-1",
        mdColMap[mdCols] ?? "md:grid-cols-2",
        lgColMap[lgCols] ?? "lg:grid-cols-3",
        gapMap[gap] ?? "gap-4",
        className
      )}
    >
      {children}
    </div>
  );
}

export function useResponsive() {
  const isMobile = useIsMobile();
  
  return {
    isMobile,
    isDesktop: !isMobile,
    show: (onlyOn: "mobile" | "desktop" | "both") => {
      if (onlyOn === "both") return true;
      if (onlyOn === "mobile") return isMobile;
      return !isMobile;
    }
  };
}