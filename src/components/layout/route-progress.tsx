"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";

export function RouteProgress({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [width, setWidth] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setActive(true);
    setWidth(12);
    const steps = [38, 66, 82, 93];
    steps.forEach((w, i) => {
      window.setTimeout(() => setWidth(w), 150 + i * 150);
    });
    timer.current = window.setTimeout(() => {
      setWidth(100);
      window.setTimeout(() => {
        setActive(false);
        setWidth(0);
      }, 250);
    }, 900);

    return () => {
      if (timer.current) {
        window.clearTimeout(timer.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!active) return null;

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-[100] h-0.5 w-full",
        className
      )}
    >
      <div
        className={"h-full bg-primary transition-all duration-300"}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}