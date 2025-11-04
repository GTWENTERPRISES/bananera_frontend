import type React from "react";
import { Card, CardContent } from "@/src/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface KpiCardProps {
  label: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  className?: string;
}

export function KpiCard({
  label,
  value,
  change,
  trend,
  icon,
  className,
}: KpiCardProps) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
            {change !== undefined && (
              <div className="mt-2 flex items-center gap-1">
                <TrendIcon
                  className={cn(
                    "h-4 w-4",
                    trend === "up" && "text-green-600",
                    trend === "down" && "text-red-600",
                    trend === "neutral" && "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    trend === "up" && "text-green-600",
                    trend === "down" && "text-red-600",
                    trend === "neutral" && "text-muted-foreground"
                  )}
                >
                  {change > 0 ? "+" : ""}
                  {change}%
                </span>
                <span className="text-sm text-muted-foreground">
                  vs semana anterior
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
