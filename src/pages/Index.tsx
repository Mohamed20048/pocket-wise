import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { StatCard } from "@/components/finance/StatCard";
import { BudgetItem } from "@/components/finance/BudgetItem";
import { CategoryDonut } from "@/components/finance/CategoryDonut";
import { TransactionRow } from "@/components/finance/TransactionRow";
import { CashflowChart } from "@/components/finance/CashflowChart";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  ShoppingBasket,
  Coffee,
  BookOpen,
  Bus,
  Music,
  Briefcase,
  Search,
  Bell,
} from "lucide-react";

const Index = () => {
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
              <div className="hidden md:flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground w-64">
                <Search className="h-3.5 w-3.5" />
                <span>Search transactions…</span>
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
            {/* Page heading */}
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">October · Week 4</p>
                <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-foreground md:text-[2.6rem]">
                  Good morning, Omar.
                </h1>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  A quiet look at where your money grew this week — and where it drifted away.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="border-border bg-card hover:bg-secondary">
                  Export report
                </Button>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft">
                  <Plus className="mr-1.5 h-4 w-4" /> Add transaction
                </Button>
              </div>
            </div>

            {/* Stat cards */}
            <section className="grid gap-4 md:grid-cols-3">
              <StatCard
                label="Current Balance"
                value="$1,847.50"
                delta="+7.2% this month"
                trend="up"
                icon={Wallet}
                accentClass="bg-primary text-primary-foreground"
              />
              <StatCard
                label="Income"
                value="$2,500.00"
                delta="+$300 vs Sept"
                trend="up"
                icon={TrendingUp}
                accentClass="bg-success/15 text-success"
              />
              <StatCard
                label="Expenses"
                value="$1,652.50"
                delta="−4.1% vs Sept"
                trend="down"
                icon={TrendingDown}
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
                      <p className="text-xs text-muted-foreground">Net this month</p>
                      <p className="font-serif text-lg font-bold text-success tabular-nums">+$847.50</p>
                    </div>
                  </div>
                  <CashflowChart />
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="font-serif text-xl font-bold text-foreground">Recent transactions</h2>
                    <button className="text-xs font-medium text-accent hover:text-foreground">View all →</button>
                  </div>
                  <div>
                    <TransactionRow icon={ShoppingBasket} title="Weekly groceries" category="Food" date="Oct 26" amount={-85.7} />
                    <TransactionRow icon={Briefcase} title="Freelance payment — Acme" category="Income" date="Oct 25" amount={400} />
                    <TransactionRow icon={Coffee} title="Morning coffee — Brewbar" category="Cafés" date="Oct 24" amount={-4.5} />
                    <TransactionRow icon={BookOpen} title="Algorithms textbook" category="Education" date="Oct 23" amount={-32.99} />
                    <TransactionRow icon={Music} title="Spotify Premium" category="Subscriptions" date="Oct 22" amount={-9.99} />
                    <TransactionRow icon={Bus} title="Monthly transit pass" category="Transport" date="Oct 21" amount={-45} />
                  </div>
                </div>
              </div>

              {/* Sidebar widgets */}
              <div className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                  <h2 className="font-serif text-xl font-bold text-foreground">Budget grove</h2>
                  <p className="mb-5 text-xs text-muted-foreground">How your envelopes are growing</p>
                  <div className="space-y-4">
                    <BudgetItem label="Groceries" spent={350} total={500} tone="primary" />
                    <BudgetItem label="Cafés & dining" spent={128} total={150} tone="warning" />
                    <BudgetItem label="Transport" spent={75} total={120} tone="accent" />
                    <BudgetItem label="Entertainment" spent={42} total={100} tone="success" />
                    <BudgetItem label="Education" spent={180} total={300} tone="primary" />
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                  <h2 className="mb-5 font-serif text-xl font-bold text-foreground">Where it went</h2>
                  <CategoryDonut
                    total="$1,652"
                    slices={[
                      { label: "Groceries", value: 350, color: "var(--primary)" },
                      { label: "Cafés", value: 128, color: "var(--warning)" },
                      { label: "Transport", value: 75, color: "var(--accent)" },
                      { label: "Entertainment", value: 42, color: "var(--success)" },
                      { label: "Education", value: 180, color: "28 17% 50%" },
                    ]}
                  />
                </div>

                <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-walnut p-6 text-primary-foreground shadow-leaf">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-primary-foreground/70">Savings goal</p>
                  <h3 className="mt-2 font-serif text-2xl font-bold">Summer trip</h3>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="font-serif text-3xl font-bold tabular-nums">$640</span>
                    <span className="text-sm text-primary-foreground/70">/ $1,200</span>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-primary-foreground/15">
                    <div className="h-full rounded-full bg-primary-foreground/80" style={{ width: "53%" }} />
                  </div>
                  <p className="mt-3 text-xs text-primary-foreground/70">53% planted · 8 weeks to bloom</p>
                </div>
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
