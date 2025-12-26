"use client";

import React from "react";
import { cn } from "@/src/lib/utils";

interface ResponsiveTableContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveTableContainer({
  children,
  className = "",
}: ResponsiveTableContainerProps) {
  return (
    <div className={cn("responsive-table responsive-table-container", className)}>
      {children}
    </div>
  );
}