"use client";

import type React from "react";
import { Button } from "@/src/components/ui/button";

export default function LoginError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-lg border p-6 text-center space-y-3">
        <h2 className="text-xl font-semibold">Error en inicio de sesión</h2>
        <p className="text-muted-foreground break-words">{error.message}</p>
        <div className="flex justify-center gap-2">
          <Button onClick={() => reset()}>Reintentar</Button>
        </div>
      </div>
    </div>
  );
}