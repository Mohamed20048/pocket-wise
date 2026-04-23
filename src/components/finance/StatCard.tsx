import { LucideIcon, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  accentClass?: string;
}

export function StatCard({ label, value, delta, trend = "neutral", icon: Icon, accentClass }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-soft transition-all hover:shadow-leaf">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
          <p className="mt-3 font-serif text-3xl font-bold tabular-nums text-foreground">{value}</p>
          {delta && (
            <div className="mt-2 flex items-center gap-1 text-xs font-medium">
              {trend === "up" ? (
                <ArrowUpRight className="h-3.5 w-3.5 text-success" />
              ) : trend === "down" ? (
                <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />
              ) : null}
              <span className={cn(
                trend === "up" && "text-success",
                trend === "down" && "text-destructive",
                trend === "neutral" && "text-muted-foreground"
              )}>{delta}</span>
            </div>
          )}
        </div>
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-foreground",
          accentClass
        )}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
