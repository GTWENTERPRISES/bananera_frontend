import Link from "next/link";
import { Button } from "@/src/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-lg border p-6 text-center space-y-3">
        <h2 className="text-xl font-semibold">Página no encontrada</h2>
        <p className="text-muted-foreground">La ruta solicitada no existe.</p>
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/dashboard">Volver al dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}