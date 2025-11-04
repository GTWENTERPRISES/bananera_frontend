"use client";

import React from "react";
import { useIsMobile } from "@/src/hooks/use-mobile";
import { cn } from "@/src/lib/utils";

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  desktopClassName?: string;
}

export function ResponsiveWrapper({
  children,
  className = "",
  mobileClassName = "",
  desktopClassName = "",
}: ResponsiveWrapperProps) {
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