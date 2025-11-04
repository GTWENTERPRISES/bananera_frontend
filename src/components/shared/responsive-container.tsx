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
  return (
    <div
      className={cn(
        `grid grid-cols-${cols} md:grid-cols-${mdCols} lg:grid-cols-${lgCols} gap-${gap}`,
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