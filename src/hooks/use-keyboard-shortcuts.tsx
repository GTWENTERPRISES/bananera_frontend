"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(onOpenSearch?: () => void) {
  const router = useRouter();

  useEffect(() => {
    const shortcuts: ShortcutConfig[] = [
      // Navegación rápida
      { key: "d", ctrlKey: true, action: () => router.push("/dashboard"), description: "Ir a Dashboard" },
      { key: "e", ctrlKey: true, action: () => router.push("/nomina/empleados"), description: "Ir a Empleados" },
      { key: "i", ctrlKey: true, action: () => router.push("/inventario/insumos"), description: "Ir a Insumos" },
      { key: "p", ctrlKey: true, action: () => router.push("/produccion/enfundes"), description: "Ir a Producción" },
      { key: "r", ctrlKey: true, action: () => router.push("/reportes"), description: "Ir a Reportes" },
      // Búsqueda
      { key: "k", ctrlKey: true, action: () => onOpenSearch?.(), description: "Abrir búsqueda" },
      { key: "k", metaKey: true, action: () => onOpenSearch?.(), description: "Abrir búsqueda (Mac)" },
    ];

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si está en un input o textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrlKey ? (e.ctrlKey || e.metaKey) : true;
        const metaMatch = shortcut.metaKey ? e.metaKey : true;
        const shiftMatch = shortcut.shiftKey ? e.shiftKey : !e.shiftKey;
        
        if (e.key.toLowerCase() === shortcut.key && ctrlMatch && metaMatch && shiftMatch) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, onOpenSearch]);
}

// Lista de shortcuts para mostrar en UI
export const keyboardShortcuts = [
  { keys: ["Ctrl", "K"], description: "Buscar módulos" },
  { keys: ["Ctrl", "D"], description: "Ir a Dashboard" },
  { keys: ["Ctrl", "E"], description: "Ir a Empleados" },
  { keys: ["Ctrl", "I"], description: "Ir a Insumos" },
  { keys: ["Ctrl", "P"], description: "Ir a Producción" },
  { keys: ["Ctrl", "R"], description: "Ir a Reportes" },
];
