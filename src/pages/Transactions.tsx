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
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Bell,
  Filter,
  Download,
  ShoppingBasket,
  Coffee,
  BookOpen,
  Bus,
  Music,
  Briefcase,
  Home,
  Utensils,
  Gift,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tx = {
  id: string;
  icon: LucideIcon;
  title: string;
  merchant: string;
  category: string;
  date: string; // ISO
  amount: number;
  method: "Card" | "Cash" | "Transfer";
};

const ALL_TX: Tx[] = [
  { id: "1", icon: ShoppingBasket, title: "Weekly groceries", merchant: "FreshMart", category: "Food", date: "2024-10-26", amount: -85.7, method: "Card" },
  { id: "2", icon: Briefcase, title: "Freelance payment", merchant: "Acme Studio", category: "Income", date: "2024-10-25", amount: 400, method: "Transfer" },
  { id: "3", icon: Coffee, title: "Morning coffee", merchant: "Brewbar", category: "Cafés", date: "2024-10-24", amount: -4.5, method: "Card" },
  { id: "4", icon: BookOpen, title: "Algorithms textbook", merchant: "Campus Books", category: "Education", date: "2024-10-23", amount: -32.99, method: "Card" },
  { id: "5", icon: Music, title: "Spotify Premium", merchant: "Spotify", category: "Subscriptions", date: "2024-10-22", amount: -9.99, method: "Card" },
  { id: "6", icon: Bus, title: "Monthly transit pass", merchant: "City Transit", category: "Transport", date: "2024-10-21", amount: -45, method: "Card" },
  { id: "7", icon: Utensils, title: "Dinner with friends", merchant: "Olive & Oak", category: "Cafés", date: "2024-10-20", amount: -38.4, method: "Card" },
  { id: "8", icon: Gift, title: "Birthday gift — Maya", merchant: "Local Florist", category: "Gifts", date: "2024-10-19", amount: -28, method: "Cash" },
  { id: "9", icon: Wallet, title: "Scholarship stipend", merchant: "University", category: "Income", date: "2024-10-18", amount: 600, method: "Transfer" },
  { id: "10", icon: Home, title: "Room rent share", merchant: "Landlord", category: "Housing", date: "2024-10-15", amount: -350, method: "Transfer" },
  { id: "11", icon: ShoppingBasket, title: "Pantry restock", merchant: "FreshMart", category: "Food", date: "2024-10-12", amount: -42.1, method: "Card" },
  { id: "12", icon: Coffee, title: "Study session latte", merchant: "Brewbar", category: "Cafés", date: "2024-10-10", amount: -5.25, method: "Card" },
  { id: "13", icon: Briefcase, title: "Tutoring — November", merchant: "Liam P.", category: "Income", date: "2024-10-08", amount: 120, method: "Cash" },
  { id: "14", icon: Bus, title: "Weekend bus ticket", merchant: "City Transit", category: "Transport", date: "2024-10-05", amount: -12, method: "Card" },
];

const CATEGORIES = ["All", "Food", "Cafés", "Transport", "Education", "Subscriptions", "Income", "Gifts", "Housing"];
const TYPES = ["All", "Income", "Expense"];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const groupByDate = (rows: Tx[]) => {
  const map = new Map<string, Tx[]>();
  rows.forEach((t) => {
    const key = formatDate(t.date);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(t);
  });
  return Array.from(map.entries());
};

const Transactions = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [type, setType] = useState("All");

  const filtered = useMemo(() => {
    return ALL_TX.filter((t) => {
      if (category !== "All" && t.category !== category) return false;
      if (type === "Income" && t.amount <= 0) return false;
      if (type === "Expense" && t.amount > 0) return false;
      if (query && !`${t.title} ${t.merchant} ${t.category}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [query, category, type]);

  const totals = useMemo(() => {
    const income = filtered.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const expense = filtered.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    return { income, expense, net: income - expense, count: filtered.length };
  }, [filtered]);

  const grouped = groupByDate(filtered);

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
              <span className="text-foreground">Transactions</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
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
            {/* Heading */}
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Ledger</p>
                <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-foreground md:text-[2.6rem]">
                  Transactions
                </h1>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  Every leaf and twig that moved through your account this month.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="border-border bg-card hover:bg-secondary">
                  <Download className="mr-1.5 h-4 w-4" /> Export CSV
                </Button>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft">
                  <Plus className="mr-1.5 h-4 w-4" /> Add transaction
                </Button>
              </div>
            </div>

            {/* Summary strip */}
            <section className="mb-6 grid gap-4 md:grid-cols-4">
              <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Showing</p>
                <p className="mt-2 font-serif text-2xl font-bold tabular-nums text-foreground">{totals.count}</p>
                <p className="mt-1 text-xs text-muted-foreground">transactions</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Income</p>
                <p className="mt-2 flex items-center gap-1 font-serif text-2xl font-bold tabular-nums text-success">
                  <ArrowUpRight className="h-5 w-5" />${totals.income.toFixed(2)}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Expenses</p>
                <p className="mt-2 flex items-center gap-1 font-serif text-2xl font-bold tabular-nums text-foreground">
                  <ArrowDownRight className="h-5 w-5 text-warning" />${totals.expense.toFixed(2)}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-gradient-walnut p-5 text-primary-foreground shadow-leaf">
                <p className="text-xs uppercase tracking-[0.16em] text-primary-foreground/70">Net flow</p>
                <p className={cn("mt-2 font-serif text-2xl font-bold tabular-nums")}>
                  {totals.net >= 0 ? "+" : "−"}${Math.abs(totals.net).toFixed(2)}
                </p>
                <p className="mt-1 text-xs text-primary-foreground/70">across selected filters</p>
              </div>
            </section>

            {/* Filters */}
            <section className="mb-6 rounded-xl border border-border bg-card p-4 shadow-soft">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, merchant or category…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-9 bg-background border-border"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-[150px] bg-background border-border">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="w-[130px] bg-background border-border">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="border-border bg-background hover:bg-secondary">
                    <Filter className="mr-1.5 h-4 w-4" /> More
                  </Button>
                </div>
              </div>
            </section>

            {/* Table / list */}
            <section className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
              {/* Desktop column header */}
              <div className="hidden md:grid grid-cols-[1.6fr_1fr_0.9fr_0.8fr_0.8fr] gap-4 border-b border-border bg-secondary/40 px-6 py-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                <span>Description</span>
                <span>Category</span>
                <span>Method</span>
                <span className="text-right">Date</span>
                <span className="text-right">Amount</span>
              </div>

              {grouped.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <p className="font-serif text-lg text-foreground">No transactions found</p>
                  <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters.</p>
                </div>
              )}

              {grouped.map(([date, rows]) => {
                const dayTotal = rows.reduce((s, r) => s + r.amount, 0);
                return (
                  <div key={date}>
                    <div className="flex items-center justify-between border-b border-border bg-background/60 px-6 py-2 text-xs">
                      <span className="font-medium uppercase tracking-[0.14em] text-muted-foreground">{date}</span>
                      <span className={cn(
                        "tabular-nums",
                        dayTotal >= 0 ? "text-success" : "text-muted-foreground"
                      )}>
                        {dayTotal >= 0 ? "+" : "−"}${Math.abs(dayTotal).toFixed(2)}
                      </span>
                    </div>
                    {rows.map((t) => {
                      const positive = t.amount > 0;
                      const Icon = t.icon;
                      return (
                        <div
                          key={t.id}
                          className="grid grid-cols-[1fr_auto] md:grid-cols-[1.6fr_1fr_0.9fr_0.8fr_0.8fr] items-center gap-4 border-b border-border px-6 py-4 last:border-b-0 transition-colors hover:bg-secondary/30"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
                              positive ? "bg-success/15 text-success" : "bg-secondary text-foreground"
                            )}>
                              <Icon className="h-4.5 w-4.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">{t.title}</p>
                              <p className="truncate text-xs text-muted-foreground">{t.merchant}</p>
                            </div>
                          </div>
                          <div className="hidden md:block">
                            <Badge variant="outline" className="border-border bg-muted/60 text-foreground font-normal">
                              {t.category}
                            </Badge>
                          </div>
                          <div className="hidden md:block text-sm text-muted-foreground">{t.method}</div>
                          <div className="hidden md:block text-right text-sm text-muted-foreground tabular-nums">
                            {formatDate(t.date)}
                          </div>
                          <div className={cn(
                            "text-right font-serif text-base font-bold tabular-nums",
                            positive ? "text-success" : "text-foreground"
                          )}>
                            {positive ? "+" : "−"}${Math.abs(t.amount).toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-border px-6 py-4 text-xs text-muted-foreground">
                <span>Showing {totals.count} of {ALL_TX.length} transactions</span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="h-8 border-border bg-background hover:bg-secondary">Previous</Button>
                  <Button variant="outline" size="sm" className="h-8 border-border bg-background hover:bg-secondary">Next</Button>
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

export default Transactions;
