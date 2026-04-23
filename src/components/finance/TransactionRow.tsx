import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionRowProps {
  icon: LucideIcon;
  title: string;
  category: string;
  date: string;
  amount: number;
}

export function TransactionRow({ icon: Icon, title, category, date, amount }: TransactionRowProps) {
  const positive = amount > 0;
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-border last:border-0">
      <div className="flex min-w-0 items-center gap-3">
        <div className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
          positive ? "bg-success/15 text-success" : "bg-secondary text-foreground"
        )}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">
            <span className="rounded-sm bg-muted px-1.5 py-0.5">{category}</span>
            <span className="mx-2">·</span>
            {date}
          </p>
        </div>
      </div>
      <span className={cn(
        "shrink-0 font-serif text-base font-bold tabular-nums",
        positive ? "text-success" : "text-foreground"
      )}>
        {positive ? "+" : "−"}${Math.abs(amount).toFixed(2)}
      </span>
    </div>
  );
}
