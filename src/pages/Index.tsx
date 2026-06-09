import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { StatCard } from "@/components/finance/StatCard";
import { BudgetItem } from "@/components/finance/BudgetItem";
import { CategoryDonut } from "@/components/finance/CategoryDonut";
import { TransactionRow } from "@/components/finance/TransactionRow";
import { CashflowChart } from "@/components/finance/CashflowChart";
import { Button } from "@/components/ui/button";
import * as Lucide from "lucide-react";
import { supabase } from "@/lib/supabase";

const iconMap: Record<string, any> = {
  ShoppingBasket: Lucide.ShoppingBasket,
  Coffee: Lucide.Coffee,
  BookOpen: Lucide.BookOpen,
  Bus: Lucide.Bus,
  Music: Lucide.Music,
  Briefcase: Lucide.Briefcase,
  Home: Lucide.Home,
  Utensils: Lucide.Utensils,
  Gift: Lucide.Gift,
  Wallet: Lucide.Wallet,
  Sparkles: Lucide.Sparkles,
};

const Index = () => {
  const [profile, setProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [featuredGoal, setFeaturedGoal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Profile
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (prof) setProfile(prof);

      // 2. Fetch Budgets
      const { data: bgts } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user.id);
      if (bgts) setBudgets(bgts);

      // 3. Fetch Transactions
      const { data: txs } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });
      if (txs) setTransactions(txs);

      // 4. Fetch Featured Goal
      const { data: goals } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id);
      if (goals && goals.length > 0) {
        const feat = goals.find((g) => g.featured) || goals[0];
        setFeaturedGoal(feat);
      }

      setLoading(false);
    }
    loadDashboard();
  }, []);

  const totals = useMemo(() => {
    const income = transactions.filter((t) => Number(t.amount) > 0).reduce((s, t) => s + Number(t.amount), 0);
    const expense = transactions.filter((t) => Number(t.amount) < 0).reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
    const balance = income - expense;
    return { balance, income, expense };
  }, [transactions]);

  const recentTxs = useMemo(() => transactions.slice(0, 6), [transactions]);

  const slices = useMemo(() => {
    const defaultTones: Record<string, string> = {
      primary: "var(--primary)",
      warning: "var(--warning)",
      accent: "var(--accent)",
      success: "var(--success)",
      muted: "28 17% 50%",
    };
    return budgets.map((b) => ({
      label: b.name,
      value: Number(b.spent),
      color: defaultTones[b.tone] || "var(--primary)",
    }));
  }, [budgets]);

  const featuredPct = featuredGoal
    ? Math.round((Number(featuredGoal.saved) / Number(featuredGoal.target)) * 100)
    : 0;

  const currentWeekInfo = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = { month: "long" };
    const month = new Date().toLocaleDateString("en-US", options);
    // Simple week calculation
    const day = new Date().getDate();
    const week = Math.ceil(day / 7);
    return `${month} · Week ${week}`;
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background" style={{ background: "var(--gradient-paper)" }}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Lucide.Sprout className="h-7 w-7 text-success animate-pulse" />
          </div>
          <p className="font-serif text-lg font-bold text-foreground">Cultivating your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />

        <div className="flex flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background/85 px-4 backdrop-blur md:px-8">
            <SidebarTrigger className="text-muted-foreground" />
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
              <span>Grove</span>
              <span>/</span>
              <span className="text-foreground">Dashboard</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button asChild variant="ghost" size="icon" className="text-muted-foreground">
                <Link to="/notifications" aria-label="Notifications">
                  <Lucide.Bell className="h-4 w-4" />
                </Link>
              </Button>
              <Link to="/profile" aria-label="Open profile" className="h-8 w-8 rounded-full bg-gradient-walnut text-primary-foreground flex items-center justify-center text-xs font-semibold transition hover:ring-2 hover:ring-ring hover:ring-offset-2 hover:ring-offset-background">
                {profile?.display_name?.substring(0, 2).toUpperCase() || "OS"}
              </Link>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
            {/* Page heading */}
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{currentWeekInfo}</p>
                <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-foreground md:text-[2.6rem]">
                  Good morning, {profile?.display_name || "Omar"}.
                </h1>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  A quiet look at where your money grew this week — and where it drifted away.
                </p>
              </div>
              <div className="flex gap-2">
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft">
                  <Link to="/transactions">
                    <Lucide.Plus className="mr-1.5 h-4 w-4" /> Add transaction
                  </Link>
                </Button>
              </div>
            </div>

            {/* Stat cards */}
            <section className="grid gap-4 md:grid-cols-3">
              <StatCard
                label="Current Balance"
                value={`$${totals.balance.toFixed(2)}`}
                delta="Updated in real time"
                trend={totals.balance >= 0 ? "up" : "down"}
                icon={Lucide.Wallet}
                accentClass="bg-primary text-primary-foreground"
              />
              <StatCard
                label="Income"
                value={`$${totals.income.toFixed(2)}`}
                delta="Total monthly inflow"
                trend="up"
                icon={Lucide.TrendingUp}
                accentClass="bg-success/15 text-success"
              />
              <StatCard
                label="Expenses"
                value={`$${totals.expense.toFixed(2)}`}
                delta="Total monthly outflow"
                trend="down"
                icon={Lucide.TrendingDown}
                accentClass="bg-warning/20 text-warning"
              />
            </section>

            {/* Main grid */}
            <section className="mt-6 grid gap-6 lg:grid-cols-3">
              {/* Cashflow + Transactions */}
              <div className="space-y-6 lg:col-span-2">
                <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                  <div className="mb-5 flex items-end justify-between">
                    <div>
                      <h2 className="font-serif text-xl font-bold text-foreground">Cashflow</h2>
                      <p className="text-xs text-muted-foreground">Income vs. expenses · last 6 months</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Net flow</p>
                      <p className={`font-serif text-lg font-bold tabular-nums ${totals.balance >= 0 ? "text-success" : "text-destructive"}`}>
                        {totals.balance >= 0 ? "+" : "−"}${Math.abs(totals.balance).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <CashflowChart />
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="font-serif text-xl font-bold text-foreground">Recent transactions</h2>
                    <Button asChild variant="ghost" size="sm" className="text-xs font-medium text-accent hover:text-foreground">
                      <Link to="/transactions">View all →</Link>
                    </Button>
                  </div>
                  <div>
                    {recentTxs.length === 0 ? (
                      <div className="py-8 text-center text-xs text-muted-foreground">No recent transactions recorded.</div>
                    ) : (
                      recentTxs.map((t) => {
                        const IconComponent = iconMap[t.icon] || Lucide.Sparkles;
                        return (
                          <TransactionRow
                            key={t.id}
                            icon={IconComponent}
                            title={t.title}
                            category={t.category}
                            date={new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            amount={Number(t.amount)}
                          />
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar widgets */}
              <div className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                  <h2 className="font-serif text-xl font-bold text-foreground">Budget grove</h2>
                  <p className="mb-5 text-xs text-muted-foreground">How your envelopes are growing</p>
                  <div className="space-y-4">
                    {budgets.length === 0 ? (
                      <div className="py-8 text-center text-xs text-muted-foreground">No budget envelopes planted yet.</div>
                    ) : (
                      budgets.slice(0, 5).map((b) => (
                        <BudgetItem
                          key={b.id}
                          label={b.name}
                          spent={Number(b.spent)}
                          total={Number(b.total)}
                          tone={b.tone}
                        />
                      ))
                    )}
                  </div>
                </div>

                {slices.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                    <h2 className="mb-5 font-serif text-xl font-bold text-foreground">Where it went</h2>
                    <CategoryDonut
                      total={`$${totals.expense.toFixed(0)}`}
                      slices={slices}
                    />
                  </div>
                )}

                {featuredGoal && (
                  <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-walnut p-6 text-primary-foreground shadow-leaf">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-primary-foreground/70">Savings goal</p>
                    <h3 className="mt-2 font-serif text-2xl font-bold">{featuredGoal.name}</h3>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="font-serif text-3xl font-bold tabular-nums">${Number(featuredGoal.saved).toLocaleString()}</span>
                      <span className="text-sm text-primary-foreground/70">/ ${Number(featuredGoal.target).toLocaleString()}</span>
                    </div>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-primary-foreground/15">
                      <div className="h-full rounded-full bg-primary-foreground/80" style={{ width: `${featuredPct}%` }} />
                    </div>
                    <p className="mt-3 text-xs text-primary-foreground/70">{featuredPct}% planted · blooms soon</p>
                  </div>
                )}
              </div>
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

export default Index;
