import { useMemo, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Bell,
  Search,
  Plus,
  Plane,
  Laptop,
  GraduationCap,
  Home,
  Gift,
  Sprout,
  Calendar,
  TrendingUp,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

type Tone = "primary" | "accent" | "warning" | "success";

interface Goal {
  id: string;
  name: string;
  tagline: string;
  icon: LucideIcon;
  saved: number;
  target: number;
  monthly: number;
  deadline: string;
  weeksLeft: number;
  tone: Tone;
  featured?: boolean;
}

const GOALS: Goal[] = [
  {
    id: "g1",
    name: "Summer trip to Lisbon",
    tagline: "Two weeks of sunshine and pastéis de nata",
    icon: Plane,
    saved: 640,
    target: 1200,
    monthly: 140,
    deadline: "Jun 2026",
    weeksLeft: 32,
    tone: "primary",
    featured: true,
  },
  {
    id: "g2",
    name: "New laptop",
    tagline: "Replace the aging study companion",
    icon: Laptop,
    saved: 480,
    target: 900,
    monthly: 90,
    deadline: "Mar 2026",
    weeksLeft: 20,
    tone: "accent",
  },
  {
    id: "g3",
    name: "Master's tuition fund",
    tagline: "First semester safety net",
    icon: GraduationCap,
    saved: 1850,
    target: 3000,
    monthly: 200,
    deadline: "Sep 2026",
    weeksLeft: 46,
    tone: "success",
  },
  {
    id: "g4",
    name: "Emergency cushion",
    tagline: "Three months of essentials",
    icon: Home,
    saved: 720,
    target: 2400,
    monthly: 120,
    deadline: "Dec 2026",
    weeksLeft: 60,
    tone: "warning",
  },
  {
    id: "g5",
    name: "Holiday gifts",
    tagline: "Thoughtful, not stressful",
    icon: Gift,
    saved: 95,
    target: 250,
    monthly: 50,
    deadline: "Dec 2025",
    weeksLeft: 8,
    tone: "primary",
  },
];

const toneRing: Record<Tone, string> = {
  primary: "text-primary",
  accent: "text-accent-foreground",
  warning: "text-warning",
  success: "text-success",
};

const toneBg: Record<Tone, string> = {
  primary: "bg-primary/15 text-primary",
  accent: "bg-accent/20 text-accent-foreground",
  warning: "bg-warning/20 text-warning",
  success: "bg-success/15 text-success",
};

const toneBar: Record<Tone, string> = {
  primary: "bg-primary",
  accent: "bg-accent",
  warning: "bg-warning",
  success: "bg-success",
};

function RingProgress({ pct, tone }: { pct: number; tone: Tone }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <svg viewBox="0 0 72 72" className="h-16 w-16 -rotate-90">
      <circle cx="36" cy="36" r={r} className="fill-none stroke-muted" strokeWidth="6" />
      <circle
        cx="36"
        cy="36"
        r={r}
        className={cn("fill-none transition-all", toneRing[tone])}
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

const Goals = () => {
  const [filter, setFilter] = useState<"all" | "active" | "near">("all");

  const filtered = useMemo(() => {
    return GOALS.filter((g) => {
      if (filter === "all") return true;
      const pct = (g.saved / g.target) * 100;
      if (filter === "near") return pct >= 70;
      if (filter === "active") return pct < 70;
      return true;
    });
  }, [filter]);

  const totals = useMemo(() => {
    const totalSaved = GOALS.reduce((s, g) => s + g.saved, 0);
    const totalTarget = GOALS.reduce((s, g) => s + g.target, 0);
    const totalMonthly = GOALS.reduce((s, g) => s + g.monthly, 0);
    return { totalSaved, totalTarget, totalMonthly };
  }, []);

  const featured = GOALS.find((g) => g.featured)!;
  const featuredPct = Math.round((featured.saved / featured.target) * 100);

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
              <span className="text-foreground">Goals</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground w-64">
                <Search className="h-3.5 w-3.5" />
                <span>Search goals…</span>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="h-8 w-8 rounded-full bg-gradient-walnut text-primary-foreground flex items-center justify-center text-xs font-semibold">
                OS
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
            {/* Heading */}
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Long-term · Saplings</p>
                <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-foreground md:text-[2.6rem]">
                  Plant a goal, watch it bloom.
                </h1>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  Goals are small saplings — they grow with each contribution. Tend them weekly and they'll outgrow the season.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="border-border bg-card hover:bg-secondary">
                  <Calendar className="mr-1.5 h-4 w-4" /> Timeline
                </Button>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft">
                  <Plus className="mr-1.5 h-4 w-4" /> New goal
                </Button>
              </div>
            </div>

            {/* Featured + summary */}
            <section className="grid gap-6 lg:grid-cols-3">
              <article className="relative overflow-hidden rounded-xl border border-border bg-gradient-walnut p-6 text-primary-foreground shadow-leaf lg:col-span-2">
                <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary-foreground/5" />
                <div className="absolute -bottom-12 -right-4 h-48 w-48 rounded-full bg-primary-foreground/5" />
                <div className="relative">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-primary-foreground/70">
                    <Sparkles className="h-3.5 w-3.5" /> Featured sapling
                  </div>
                  <h2 className="mt-3 font-serif text-3xl font-bold leading-tight">{featured.name}</h2>
                  <p className="mt-1 text-sm text-primary-foreground/75">{featured.tagline}</p>

                  <div className="mt-6 flex items-baseline gap-3">
                    <span className="font-serif text-4xl font-bold tabular-nums">${featured.saved}</span>
                    <span className="text-sm text-primary-foreground/70">/ ${featured.target}</span>
                  </div>

                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-primary-foreground/15">
                    <div
                      className="h-full rounded-full bg-primary-foreground/85 transition-all"
                      style={{ width: `${featuredPct}%` }}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="text-primary-foreground/60">Progress</p>
                      <p className="mt-1 font-serif text-base font-bold">{featuredPct}%</p>
                    </div>
                    <div>
                      <p className="text-primary-foreground/60">Monthly</p>
                      <p className="mt-1 font-serif text-base font-bold tabular-nums">${featured.monthly}</p>
                    </div>
                    <div>
                      <p className="text-primary-foreground/60">Bloom date</p>
                      <p className="mt-1 font-serif text-base font-bold">{featured.deadline}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2">
                    <Button
                      variant="outline"
                      className="h-9 border-primary-foreground/30 bg-primary-foreground/10 text-xs text-primary-foreground hover:bg-primary-foreground/20"
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" /> Add to sapling
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-9 text-xs text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                    >
                      Adjust plan
                    </Button>
                  </div>
                </div>
              </article>

              <div className="flex flex-col gap-4">
                <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Total saved</p>
                  <p className="mt-2 font-serif text-2xl font-bold text-foreground tabular-nums">
                    ${totals.totalSaved.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    of ${totals.totalTarget.toLocaleString()} across {GOALS.length} saplings
                  </p>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-walnut"
                      style={{ width: `${Math.round((totals.totalSaved / totals.totalTarget) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Monthly watering</p>
                  <p className="mt-2 font-serif text-2xl font-bold text-foreground tabular-nums">
                    ${totals.totalMonthly}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-success">
                    <TrendingUp className="h-3 w-3" /> 18% of monthly income
                  </p>
                </div>
              </div>
            </section>

            {/* Filters */}
            <section className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <h2 className="font-serif text-xl font-bold text-foreground">All saplings</h2>
                <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] text-muted-foreground">
                  {filtered.length} of {GOALS.length}
                </span>
              </div>
              <div className="flex items-center gap-1 rounded-md border border-border bg-card p-1">
                {(["all", "active", "near"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "rounded px-3 py-1 text-xs font-medium capitalize transition-colors",
                      filter === f
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {f === "near" ? "Near bloom" : f}
                  </button>
                ))}
              </div>
            </section>

            {/* Goal grid */}
            <section className="mt-5 grid gap-5 md:grid-cols-2">
              {filtered.map((g) => {
                const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
                const remaining = g.target - g.saved;
                const monthsToFinish = Math.ceil(remaining / g.monthly);
                const Icon = g.icon;
                return (
                  <article
                    key={g.id}
                    className="group rounded-xl border border-border bg-card p-5 shadow-soft transition-all hover:shadow-leaf"
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <RingProgress pct={pct} tone={g.tone} />
                        <div
                          className={cn(
                            "absolute inset-0 m-auto flex h-9 w-9 items-center justify-center rounded-full",
                            toneBg[g.tone],
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate font-serif text-lg font-bold text-foreground">{g.name}</h3>
                            <p className="truncate text-xs text-muted-foreground">{g.tagline}</p>
                          </div>
                          <span className="shrink-0 rounded-full border border-border bg-secondary/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            {g.deadline}
                          </span>
                        </div>

                        <div className="mt-3 flex items-baseline justify-between">
                          <p className="font-serif text-xl font-bold text-foreground tabular-nums">
                            ${g.saved.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground tabular-nums">
                            / ${g.target.toLocaleString()}
                          </p>
                        </div>

                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn("h-full rounded-full transition-all", toneBar[g.tone])}
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-[11px]">
                          <div>
                            <p className="text-muted-foreground">Monthly</p>
                            <p className="mt-0.5 font-medium text-foreground tabular-nums">${g.monthly}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Left</p>
                            <p className="mt-0.5 font-medium text-foreground tabular-nums">
                              ${remaining.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">ETA</p>
                            <p className="mt-0.5 font-medium text-foreground">{monthsToFinish} mo</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 flex-1 border-border bg-background text-xs hover:bg-secondary"
                      >
                        <Plus className="mr-1 h-3 w-3" /> Add
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 flex-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Details
                      </Button>
                    </div>
                  </article>
                );
              })}

              <button className="group flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/50 p-5 text-muted-foreground transition-all hover:border-primary/50 hover:bg-card hover:text-foreground">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-border group-hover:border-primary/50">
                  <Sprout className="h-4 w-4" />
                </div>
                <p className="font-serif text-sm font-medium">Plant a new sapling</p>
                <p className="text-[11px] text-muted-foreground/80">
                  Name your dream, choose a target, set a date
                </p>
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

export default Goals;
