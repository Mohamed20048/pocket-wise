import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Bell,
  Search,
  Plus,
  ShoppingBasket,
  Coffee,
  Bus,
  Music,
  BookOpen,
  Home,
  Sparkles,
  Heart,
  Sprout,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

type Tone = "primary" | "accent" | "warning" | "success" | "muted";

interface Budget {
  id: string;
  name: string;
  category: string;
  icon: LucideIcon;
  spent: number;
  total: number;
  tone: Tone;
  rollover?: number;
}

const BUDGETS: Budget[] = [
  { id: "b1", name: "Groceries", category: "Food", icon: ShoppingBasket, spent: 350, total: 500, tone: "primary", rollover: 12 },
  { id: "b2", name: "Cafés & dining", category: "Food", icon: Coffee, spent: 128, total: 150, tone: "warning" },
  { id: "b3", name: "Transport", category: "Mobility", icon: Bus, spent: 75, total: 120, tone: "accent" },
  { id: "b4", name: "Entertainment", category: "Leisure", icon: Music, spent: 42, total: 100, tone: "success", rollover: 8 },
  { id: "b5", name: "Education", category: "Growth", icon: BookOpen, spent: 180, total: 300, tone: "primary" },
  { id: "b6", name: "Rent & utilities", category: "Home", icon: Home, spent: 620, total: 700, tone: "warning" },
  { id: "b7", name: "Self-care", category: "Wellness", icon: Heart, spent: 24, total: 80, tone: "success" },
  { id: "b8", name: "Misc & extras", category: "Other", icon: Sparkles, spent: 95, total: 90, tone: "warning" },
];

const toneBar: Record<Tone, string> = {
  primary: "bg-primary",
  accent: "bg-accent",
  warning: "bg-warning",
  success: "bg-success",
  muted: "bg-muted-foreground/40",
};

const toneIconBg: Record<Tone, string> = {
  primary: "bg-primary/15 text-primary",
  accent: "bg-accent/20 text-accent-foreground",
  warning: "bg-warning/20 text-warning",
  success: "bg-success/15 text-success",
  muted: "bg-muted text-muted-foreground",
};

function statusOf(spent: number, total: number) {
  const pct = (spent / total) * 100;
  if (pct >= 100) return { label: "Over", tone: "warning" as const, icon: AlertTriangle };
  if (pct >= 85) return { label: "Watch", tone: "warning" as const, icon: AlertTriangle };
  if (pct >= 50) return { label: "On track", tone: "primary" as const, icon: TrendingUp };
  return { label: "Healthy", tone: "success" as const, icon: CheckCircle2 };
}

const Budgets = () => {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return BUDGETS.filter((b) => {
      const matchQ = `${b.name} ${b.category}`.toLowerCase().includes(query.toLowerCase());
      if (!matchQ) return false;
      if (filter === "all") return true;
      const pct = (b.spent / b.total) * 100;
      if (filter === "healthy") return pct < 50;
      if (filter === "ontrack") return pct >= 50 && pct < 85;
      if (filter === "watch") return pct >= 85 && pct < 100;
      if (filter === "over") return pct >= 100;
      return true;
    });
  }, [query, filter]);

  const totals = useMemo(() => {
    const totalAllocated = BUDGETS.reduce((s, b) => s + b.total, 0);
    const totalSpent = BUDGETS.reduce((s, b) => s + b.spent, 0);
    const remaining = totalAllocated - totalSpent;
    const overCount = BUDGETS.filter((b) => b.spent >= b.total).length;
    return { totalAllocated, totalSpent, remaining, overCount };
  }, []);

  const overallPct = Math.min(100, Math.round((totals.totalSpent / totals.totalAllocated) * 100));

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background/85 px-4 backdrop-blur md:px-8">
            <SidebarTrigger className="text-muted-foreground" />
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
              <span>Grove</span>
              <span>/</span>
              <span className="text-foreground">Budgets</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground w-64">
                <Search className="h-3.5 w-3.5" />
                <span>Search budgets…</span>
              </div>
              <Button asChild variant="ghost" size="icon" className="text-muted-foreground">
                <Link to="/notifications" aria-label="Notifications">
                  <Bell className="h-4 w-4" />
                </Link>
              </Button>
              <Link to="/profile" aria-label="Open profile" className="h-8 w-8 rounded-full bg-gradient-walnut text-primary-foreground flex items-center justify-center text-xs font-semibold transition hover:ring-2 hover:ring-ring hover:ring-offset-2 hover:ring-offset-background">
                OS
              </Link>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
            {/* Page heading */}
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">October · Envelopes</p>
                <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-foreground md:text-[2.6rem]">
                  Tend your budgets.
                </h1>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  Each envelope is a small garden bed — water it weekly, prune what overflows, and watch your habits root.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="border-border bg-card hover:bg-secondary">
                  Reset month
                </Button>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft">
                  <Plus className="mr-1.5 h-4 w-4" /> New budget
                </Button>
              </div>
            </div>

            {/* Overview */}
            <section className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-6 shadow-soft lg:col-span-2">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Monthly envelope</p>
                    <p className="mt-2 font-serif text-3xl font-bold text-foreground tabular-nums">
                      ${totals.totalSpent.toFixed(2)}
                      <span className="ml-2 text-base font-normal text-muted-foreground">
                        of ${totals.totalAllocated.toFixed(2)}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Remaining</p>
                    <p className="font-serif text-xl font-bold text-success tabular-nums">
                      ${totals.remaining.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-walnut transition-all"
                    style={{ width: `${overallPct}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{overallPct}% of monthly intention used</span>
                  <span>6 days left in cycle</span>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-gradient-walnut p-6 text-primary-foreground shadow-leaf">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-primary-foreground/70">
                  <Sprout className="h-3.5 w-3.5" /> Mindful note
                </div>
                <p className="mt-3 font-serif text-lg leading-snug">
                  You're {overallPct}% through October's envelope with {totals.overCount} basket{totals.overCount === 1 ? "" : "s"} overflowing.
                </p>
                <p className="mt-3 text-xs text-primary-foreground/75">
                  Consider moving unused funds from Entertainment into Misc — small reshuffles keep the grove balanced.
                </p>
                <Button
                  variant="outline"
                  className="mt-4 h-8 border-primary-foreground/30 bg-primary-foreground/10 text-xs text-primary-foreground hover:bg-primary-foreground/20"
                >
                  Rebalance envelopes
                </Button>
              </div>
            </section>

            {/* Filters */}
            <section className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <h2 className="font-serif text-xl font-bold text-foreground">Your envelopes</h2>
                <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] text-muted-foreground">
                  {filtered.length} of {BUDGETS.length}
                </span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search envelopes…"
                    className="h-9 w-full pl-9 sm:w-60"
                  />
                </div>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="h-9 w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="healthy">Healthy</SelectItem>
                    <SelectItem value="ontrack">On track</SelectItem>
                    <SelectItem value="watch">Watch</SelectItem>
                    <SelectItem value="over">Overflowing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </section>

            {/* Budget grid */}
            <section className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((b) => {
                const pct = Math.min(100, Math.round((b.spent / b.total) * 100));
                const remaining = b.total - b.spent;
                const status = statusOf(b.spent, b.total);
                const StatusIcon = status.icon;
                const Icon = b.icon;
                return (
                  <article
                    key={b.id}
                    className="group rounded-xl border border-border bg-card p-5 shadow-soft transition-all hover:shadow-leaf"
                  >
                    <header className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("flex h-10 w-10 items-center justify-center rounded-md", toneIconBg[b.tone])}>
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <h3 className="font-serif text-lg font-bold leading-tight text-foreground">{b.name}</h3>
                          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{b.category}</p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                          status.tone === "warning" && "border-warning/40 bg-warning/10 text-warning",
                          status.tone === "primary" && "border-primary/30 bg-primary/10 text-primary",
                          status.tone === "success" && "border-success/30 bg-success/10 text-success",
                        )}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                    </header>

                    <div className="mt-5 flex items-baseline justify-between">
                      <p className="font-serif text-2xl font-bold text-foreground tabular-nums">
                        ${b.spent.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground tabular-nums">/ ${b.total.toFixed(2)}</p>
                    </div>

                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full transition-all", toneBar[b.tone])}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{pct}% used</span>
                      <span className={cn("tabular-nums", remaining < 0 ? "text-warning font-medium" : "")}>
                        {remaining < 0 ? `−$${Math.abs(remaining).toFixed(2)} over` : `$${remaining.toFixed(2)} left`}
                      </span>
                    </div>

                    {b.rollover ? (
                      <p className="mt-3 flex items-center gap-1.5 border-t border-border pt-3 text-[11px] text-muted-foreground">
                        <Sprout className="h-3 w-3 text-success" />
                        ${b.rollover.toFixed(2)} rolled over from September
                      </p>
                    ) : null}
                  </article>
                );
              })}

              {/* Add new envelope tile */}
              <button className="group flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/50 p-5 text-muted-foreground transition-all hover:border-primary/50 hover:bg-card hover:text-foreground">
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-dashed border-border group-hover:border-primary/50">
                  <Plus className="h-4 w-4" />
                </div>
                <p className="font-serif text-sm font-medium">Plant a new envelope</p>
                <p className="text-[11px] text-muted-foreground/80">Choose a category and seed an amount</p>
              </button>
            </section>

            <footer className="mt-10 border-t border-border pt-5 text-center text-xs text-muted-foreground">
              Grove Ledger · Cultivating mindful habits for long-term financial well-being
            </footer>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Budgets;
