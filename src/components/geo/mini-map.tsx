"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { MapPin } from "lucide-react";

export function MiniMap() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Ubicación de Fincas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] bg-muted rounded-md flex items-center justify-center text-muted-foreground text-sm">
          Mapa de fincas
        </div>
      </CardContent>
    </Card>
  );
}
