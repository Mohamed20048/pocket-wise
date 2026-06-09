import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import * as Lucide from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type Tone = "primary" | "accent" | "warning" | "success";

const iconMap: Record<string, any> = {
  Plane: Lucide.Plane,
  Laptop: Lucide.Laptop,
  GraduationCap: Lucide.GraduationCap,
  Home: Lucide.Home,
  Gift: Lucide.Gift,
  Sprout: Lucide.Sprout,
};

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
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New goal dialog state
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [iconKey, setIconKey] = useState("Plane");
  const [savedAmount, setSavedAmount] = useState("");
  const [target, setTarget] = useState("");
  const [monthly, setMonthly] = useState("");
  const [deadline, setDeadline] = useState("");
  const [tone, setTone] = useState<Tone>("primary");
  const [featured, setFeatured] = useState(false);
  const [creating, setCreating] = useState(false);

  // Add fund state
  const [addFundOpen, setAddFundOpen] = useState(false);
  const [activeGoal, setActiveGoal] = useState<any>(null);
  const [contribution, setContribution] = useState("");
  const [updatingGoal, setUpdatingGoal] = useState(false);

  const fetchGoals = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id);
    if (data) {
      setGoals(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !target || !monthly || !deadline) {
      toast.error("Please fill in name, target limit, monthly value, and deadline.");
      return;
    }
    setCreating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (featured) {
      // Set all other goals for this user to featured = false
      await supabase
        .from("goals")
        .update({ featured: false })
        .eq("user_id", user.id);
    }

    const { data, error } = await supabase
      .from("goals")
      .insert({
        user_id: user.id,
        name,
        tagline,
        icon: iconKey,
        saved: parseFloat(savedAmount || "0"),
        target: parseFloat(target),
        monthly: parseFloat(monthly),
        deadline,
        tone,
        featured,
      })
      .select()
      .single();

    setCreating(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Goal planted successfully!");
      if (data) {
        setGoals((prev) => {
          if (featured) {
            return [...prev.map((g) => ({ ...g, featured: false })), data];
          }
          return [...prev, data];
        });
      }
      setOpen(false);
      setName("");
      setTagline("");
      setTarget("");
      setMonthly("");
      setDeadline("");
      setSavedAmount("");
      setFeatured(false);
    }
  };

  const handleAddContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGoal || !contribution) return;
    setUpdatingGoal(true);

    const newSaved = Number(activeGoal.saved) + parseFloat(contribution);
    if (newSaved > Number(activeGoal.target)) {
      toast.error("Contribution exceeds target amount!");
      setUpdatingGoal(false);
      return;
    }

    const { data, error } = await supabase
      .from("goals")
      .update({ saved: newSaved })
      .eq("id", activeGoal.id)
      .select()
      .single();

    setUpdatingGoal(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Watered! Funds added successfully.");
      if (data) {
        setGoals((prev) => prev.map((g) => (g.id === data.id ? data : g)));
      }
      setAddFundOpen(false);
      setContribution("");
    }
  };

  const filtered = useMemo(() => {
    return goals.filter((g) => {
      if (filter === "all") return true;
      const pct = g.target > 0 ? (g.saved / g.target) * 100 : 0;
      if (filter === "near") return pct >= 70;
      if (filter === "active") return pct < 70;
      return true;
    });
  }, [goals, filter]);

  const totals = useMemo(() => {
    const totalSaved = goals.reduce((s, g) => s + Number(g.saved), 0);
    const totalTarget = goals.reduce((s, g) => s + Number(g.target), 0);
    const totalMonthly = goals.reduce((s, g) => s + Number(g.monthly), 0);
    return { totalSaved, totalTarget, totalMonthly };
  }, [goals]);

  const featuredGoal = goals.find((g) => g.featured) || goals[0];
  const featuredPct = featuredGoal
    ? Math.round((Number(featuredGoal.saved) / Number(featuredGoal.target)) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background" style={{ background: "var(--gradient-paper)" }}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Lucide.Sprout className="h-7 w-7 text-success animate-pulse" />
          </div>
          <p className="font-serif text-lg font-bold text-foreground">Watering the saplings…</p>
        </div>
      </div>
    );
  }

  const FeaturedIcon = featuredGoal ? (iconMap[featuredGoal.icon] || Lucide.Sparkles) : null;

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
                <Lucide.Search className="h-3.5 w-3.5" />
                <span>Search goals…</span>
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
                <Button onClick={() => setOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft">
                  <Lucide.Plus className="mr-1.5 h-4 w-4" /> New goal
                </Button>
              </div>
            </div>

            {/* Featured + summary */}
            {featuredGoal ? (
              <section className="grid gap-6 lg:grid-cols-3">
                <article className="relative overflow-hidden rounded-xl border border-border bg-gradient-walnut p-6 text-primary-foreground shadow-leaf lg:col-span-2">
                  <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary-foreground/5" />
                  <div className="absolute -bottom-12 -right-4 h-48 w-48 rounded-full bg-primary-foreground/5" />
                  <div className="relative">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-primary-foreground/70">
                      <Lucide.Sparkles className="h-3.5 w-3.5" /> Featured sapling
                    </div>
                    <h2 className="mt-3 font-serif text-3xl font-bold leading-tight">{featuredGoal.name}</h2>
                    <p className="mt-1 text-sm text-primary-foreground/75">{featuredGoal.tagline}</p>

                    <div className="mt-6 flex items-baseline gap-3">
                      <span className="font-serif text-4xl font-bold tabular-nums">${Number(featuredGoal.saved).toLocaleString()}</span>
                      <span className="text-sm text-primary-foreground/70">/ ${Number(featuredGoal.target).toLocaleString()}</span>
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
                        <p className="mt-1 font-serif text-base font-bold tabular-nums">${Number(featuredGoal.monthly).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-primary-foreground/60">Bloom date</p>
                        <p className="mt-1 font-serif text-base font-bold">{featuredGoal.deadline}</p>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-2">
                      <Button
                        onClick={() => {
                          setActiveGoal(featuredGoal);
                          setAddFundOpen(true);
                        }}
                        variant="outline"
                        className="h-9 border-primary-foreground/30 bg-primary-foreground/10 text-xs text-primary-foreground hover:bg-primary-foreground/20"
                      >
                        <Lucide.Plus className="mr-1 h-3.5 w-3.5" /> Add to sapling
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
                      of ${totals.totalTarget.toLocaleString()} across {goals.length} saplings
                    </p>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-walnut"
                        style={{ width: `${totals.totalTarget > 0 ? Math.round((totals.totalSaved / totals.totalTarget) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Monthly watering</p>
                    <p className="mt-2 font-serif text-2xl font-bold text-foreground tabular-nums">
                      ${totals.totalMonthly.toLocaleString()}
                    </p>
                  </div>
                </div>
              </section>
            ) : null}

            {/* Filters */}
            <section className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <h2 className="font-serif text-xl font-bold text-foreground">All saplings</h2>
                <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] text-muted-foreground">
                  {filtered.length} of {goals.length}
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
                const savedNum = Number(g.saved);
                const targetNum = Number(g.target);
                const pct = targetNum > 0 ? Math.min(100, Math.round((savedNum / targetNum) * 100)) : 0;
                const remaining = targetNum - savedNum;
                const monthsToFinish = g.monthly > 0 ? Math.ceil(remaining / Number(g.monthly)) : 0;
                const IconComponent = iconMap[g.icon] || Lucide.Sparkles;
                return (
                  <article
                    key={g.id}
                    className="group rounded-xl border border-border bg-card p-5 shadow-soft transition-all hover:shadow-leaf"
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <RingProgress pct={pct} tone={g.tone as Tone} />
                        <div
                          className={cn(
                            "absolute inset-0 m-auto flex h-9 w-9 items-center justify-center rounded-full",
                            toneBg[g.tone as Tone],
                          )}
                        >
                          <IconComponent className="h-4 w-4" />
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
                            ${savedNum.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground tabular-nums">
                            / ${targetNum.toLocaleString()}
                          </p>
                        </div>

                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn("h-full rounded-full transition-all", toneBar[g.tone as Tone])}
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-[11px]">
                          <div>
                            <p className="text-muted-foreground">Monthly</p>
                            <p className="mt-0.5 font-medium text-foreground tabular-nums">${Number(g.monthly).toLocaleString()}</p>
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
                        onClick={() => {
                          setActiveGoal(g);
                          setAddFundOpen(true);
                        }}
                        className="h-8 flex-1 border-border bg-background text-xs hover:bg-secondary"
                      >
                        <Lucide.Plus className="mr-1 h-3 w-3" /> Add
                      </Button>
                    </div>
                  </article>
                );
              })}

              {/* Plant a new sapling tile */}
              <button
                onClick={() => setOpen(true)}
                className="group flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/50 p-5 text-muted-foreground transition-all hover:border-primary/50 hover:bg-card hover:text-foreground"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-border group-hover:border-primary/50">
                  <Lucide.Sprout className="h-4 w-4" />
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

      {/* New Goal Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleCreateGoal}>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Plant a goal sapling</DialogTitle>
              <DialogDescription>
                Define a long-term goal. Water it consistently to watch it grow.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right text-xs uppercase tracking-wider text-muted-foreground">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Lisbon Summer Trip"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tagline" className="text-right text-xs uppercase tracking-wider text-muted-foreground">Tagline</Label>
                <Input
                  id="tagline"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Two weeks of sunshine"
                  className="col-span-3"
                />
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
                <Label htmlFor="saved" className="text-right text-xs uppercase tracking-wider text-muted-foreground">Saved So Far ($)</Label>
                <Input
                  id="saved"
                  type="number"
                  value={savedAmount}
                  onChange={(e) => setSavedAmount(e.target.value)}
                  placeholder="100"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="target" className="text-right text-xs uppercase tracking-wider text-muted-foreground">Target Limit ($)</Label>
                <Input
                  id="target"
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="1200"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="monthly" className="text-right text-xs uppercase tracking-wider text-muted-foreground">Monthly ($)</Label>
                <Input
                  id="monthly"
                  type="number"
                  value={monthly}
                  onChange={(e) => setMonthly(e.target.value)}
                  placeholder="100"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="deadline" className="text-right text-xs uppercase tracking-wider text-muted-foreground">Deadline</Label>
                <Input
                  id="deadline"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  placeholder="Jun 2026"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tone" className="text-right text-xs uppercase tracking-wider text-muted-foreground">Tone Color</Label>
                <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Color Tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {["primary", "accent", "warning", "success"].map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="featured" className="text-right text-xs uppercase tracking-wider text-muted-foreground">Featured</Label>
                <div className="col-span-3 flex items-center">
                  <Switch checked={featured} onCheckedChange={setFeatured} id="featured" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={creating} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {creating ? "Planting..." : "Plant Sapling"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Contribution Dialog */}
      <Dialog open={addFundOpen} onOpenChange={setAddFundOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleAddContribution}>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Water your sapling</DialogTitle>
              <DialogDescription>
                Add funds to the goal: <span className="font-semibold text-foreground">"{activeGoal?.name}"</span>
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contribution" className="text-right text-xs uppercase tracking-wider text-muted-foreground">Contribution ($)</Label>
                <Input
                  id="contribution"
                  type="number"
                  step="0.01"
                  value={contribution}
                  onChange={(e) => setContribution(e.target.value)}
                  placeholder="50"
                  className="col-span-3"
                  required
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setAddFundOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={updatingGoal} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {updatingGoal ? "Watering..." : "Add Funds"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Goals;
