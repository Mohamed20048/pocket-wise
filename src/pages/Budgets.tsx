import { useMemo, useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import * as Lucide from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type Tone = "primary" | "accent" | "warning" | "success" | "muted";

const iconMap: Record<string, any> = {
  ShoppingBasket: Lucide.ShoppingBasket,
  Coffee: Lucide.Coffee,
  Bus: Lucide.Bus,
  Music: Lucide.Music,
  BookOpen: Lucide.BookOpen,
  Home: Lucide.Home,
  Heart: Lucide.Heart,
  Sparkles: Lucide.Sparkles,
};

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
  const pct = total > 0 ? (spent / total) * 100 : 0;
  if (pct >= 100) return { label: "Over", tone: "warning" as const, icon: Lucide.AlertTriangle };
  if (pct >= 85) return { label: "Watch", tone: "warning" as const, icon: Lucide.AlertTriangle };
  if (pct >= 50) return { label: "On track", tone: "primary" as const, icon: Lucide.TrendingUp };
  return { label: "Healthy", tone: "success" as const, icon: Lucide.CheckCircle2 };
}

const Budgets = () => {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New budget dialog states
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Food");
  const [iconKey, setIconKey] = useState("ShoppingBasket");
  const [totalLimit, setTotalLimit] = useState("");
  const [budgetTone, setBudgetTone] = useState<Tone>("primary");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function fetchBudgets() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user.id);
      if (data) {
        setBudgets(data);
      }
      setLoading(false);
    }
    fetchBudgets();
  }, []);

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !totalLimit) {
      toast.error("Please fill in budget name and total limit.");
      return;
    }
    setCreating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("budgets")
      .insert({
        user_id: user.id,
        name,
        category,
        icon: iconKey,
        total: parseFloat(totalLimit),
        spent: 0.00,
        tone: budgetTone,
        rollover: 0.00,
      })
      .select()
      .single();

    setCreating(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Envelope planted successfully!");
      if (data) {
        setBudgets((prev) => [...prev, data]);
      }
      setOpen(false);
      setName("");
      setTotalLimit("");
    }
  };

  const filtered = useMemo(() => {
    return budgets.filter((b) => {
      const matchQ = `${b.name} ${b.category}`.toLowerCase().includes(query.toLowerCase());
      if (!matchQ) return false;
      if (filter === "all") return true;
      const pct = b.total > 0 ? (b.spent / b.total) * 100 : 0;
      if (filter === "healthy") return pct < 50;
      if (filter === "ontrack") return pct >= 50 && pct < 85;
      if (filter === "watch") return pct >= 85 && pct < 100;
      if (filter === "over") return pct >= 100;
      return true;
    });
  }, [budgets, query, filter]);

  const totals = useMemo(() => {
    const totalAllocated = budgets.reduce((s, b) => s + Number(b.total), 0);
    const totalSpent = budgets.reduce((s, b) => s + Number(b.spent), 0);
    const remaining = totalAllocated - totalSpent;
    const overCount = budgets.filter((b) => Number(b.spent) >= Number(b.total)).length;
    return { totalAllocated, totalSpent, remaining, overCount };
  }, [budgets]);

  const overallPct = totals.totalAllocated > 0
    ? Math.min(100, Math.round((totals.totalSpent / totals.totalAllocated) * 100))
    : 0;

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background" style={{ background: "var(--gradient-paper)" }}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Lucide.Sprout className="h-7 w-7 text-success animate-pulse" />
          </div>
          <p className="font-serif text-lg font-bold text-foreground">Watering the soil…</p>
        </div>
      </div>
    );
  }

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
                <Lucide.Search className="h-3.5 w-3.5" />
                <span>Search budgets…</span>
              </div>
              <Button asChild variant="ghost" size="icon" className="text-muted-foreground">
                <Link to="/notifications" aria-label="Notifications">
                  <Lucide.Bell className="h-4 w-4" />
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
                <Button onClick={() => setOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft">
                  <Lucide.Plus className="mr-1.5 h-4 w-4" /> New budget
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
                  <Lucide.Sprout className="h-3.5 w-3.5" /> Mindful note
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
                  {filtered.length} of {budgets.length}
                </span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Lucide.Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
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
                const spentNum = Number(b.spent);
                const totalNum = Number(b.total);
                const pct = totalNum > 0 ? Math.min(100, Math.round((spentNum / totalNum) * 100)) : 0;
                const remaining = totalNum - spentNum;
                const status = statusOf(spentNum, totalNum);
                const StatusIcon = status.icon;
                const IconComponent = iconMap[b.icon] || Lucide.Sparkles;
                return (
                  <article
                    key={b.id}
                    className="group rounded-xl border border-border bg-card p-5 shadow-soft transition-all hover:shadow-leaf"
                  >
                    <header className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("flex h-10 w-10 items-center justify-center rounded-md", toneIconBg[b.tone as Tone])}>
                          <IconComponent className="h-4.5 w-4.5" />
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
                        ${spentNum.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground tabular-nums">/ ${totalNum.toFixed(2)}</p>
                    </div>

                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full transition-all", toneBar[b.tone as Tone])}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{pct}% used</span>
                      <span className={cn("tabular-nums", remaining < 0 ? "text-warning font-medium" : "")}>
                        {remaining < 0 ? `−$${Math.abs(remaining).toFixed(2)} over` : `$${remaining.toFixed(2)} left`}
                      </span>
                    </div>

                    {b.rollover && Number(b.rollover) > 0 ? (
                      <p className="mt-3 flex items-center gap-1.5 border-t border-border pt-3 text-[11px] text-muted-foreground">
                        <Lucide.Sprout className="h-3 w-3 text-success" />
                        ${Number(b.rollover).toFixed(2)} rolled over from September
                      </p>
                    ) : null}
                  </article>
                );
              })}

              {/* Add new envelope tile */}
              <button
                onClick={() => setOpen(true)}
                className="group flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/50 p-5 text-muted-foreground transition-all hover:border-primary/50 hover:bg-card hover:text-foreground"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-dashed border-border group-hover:border-primary/50">
                  <Lucide.Plus className="h-4 w-4" />
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

      {/* New Budget Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleCreateBudget}>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Plant an envelope</DialogTitle>
              <DialogDescription>
                Define a new budget envelope. It will help monitor your spending with care.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right text-xs uppercase tracking-wider text-muted-foreground">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Groceries"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right text-xs uppercase tracking-wider text-muted-foreground">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Food", "Mobility", "Leisure", "Growth", "Home", "Wellness", "Other"].map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="icon" className="text-right text-xs uppercase tracking-wider text-muted-foreground">Icon</Label>
                <Select value={iconKey} onValueChange={setIconKey}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(iconMap).map((key) => (
                      <SelectItem key={key} value={key}>{key}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="total" className="text-right text-xs uppercase tracking-wider text-muted-foreground">Limit ($)</Label>
                <Input
                  id="total"
                  type="number"
                  value={totalLimit}
                  onChange={(e) => setTotalLimit(e.target.value)}
                  placeholder="500"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tone" className="text-right text-xs uppercase tracking-wider text-muted-foreground">Tone Color</Label>
                <Select value={budgetTone} onValueChange={(v) => setBudgetTone(v as Tone)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Color Tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {["primary", "accent", "warning", "success", "muted"].map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={creating} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {creating ? "Planting..." : "Plant Envelope"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Budgets;
