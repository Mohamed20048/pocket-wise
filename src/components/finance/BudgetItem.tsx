import { cn } from "@/lib/utils";

interface BudgetItemProps {
  label: string;
  spent: number;
  total: number;
  tone?: "primary" | "accent" | "warning" | "success";
}

export function BudgetItem({ label, spent, total, tone = "primary" }: BudgetItemProps) {
  const pct = Math.min(100, Math.round((spent / total) * 100));
  const toneClass = {
    primary: "bg-primary",
    accent: "bg-accent",
    warning: "bg-warning",
    success: "bg-success",
  }[tone];

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs tabular-nums text-muted-foreground">
          ${spent.toFixed(2)} <span className="text-muted-foreground/60">/ ${total.toFixed(2)}</span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all", toneClass)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
