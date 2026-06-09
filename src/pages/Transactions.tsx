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
import { Badge } from "@/components/ui/badge";
import * as Lucide from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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

const categoryIconMap: Record<string, string> = {
  Food: "ShoppingBasket",
  Cafés: "Coffee",
  Transport: "Bus",
  Education: "BookOpen",
  Subscriptions: "Music",
  Income: "Briefcase",
  Gifts: "Gift",
  Housing: "Home",
  Other: "Sparkles",
};

const CATEGORIES = ["All", "Food", "Cafés", "Transport", "Education", "Subscriptions", "Income", "Gifts", "Housing"];
const TYPES = ["All", "Income", "Expense"];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const groupByDate = (rows: any[]) => {
  const map = new Map<string, any[]>();
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

  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [newTxCategory, setNewTxCategory] = useState("Food");
  const [method, setMethod] = useState<"Card" | "Cash" | "Transfer">("Card");
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [budgetId, setBudgetId] = useState<string>("none");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: txs } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });
      if (txs) {
        setTransactions(txs);
      }

      const { data: bgts } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user.id);
      if (bgts) {
        setBudgets(bgts);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !merchant || !amount) {
      toast.error("Please fill in title, merchant, and amount.");
      return;
    }
    setCreating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const isIncome = newTxCategory === "Income";
    const finalAmount = isIncome ? Math.abs(parseFloat(amount)) : -Math.abs(parseFloat(amount));
    const finalIcon = categoryIconMap[newTxCategory] || "Sparkles";

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        budget_id: budgetId === "none" ? null : budgetId,
        title,
        merchant,
        category: newTxCategory,
        date,
        amount: finalAmount,
        method,
        icon: finalIcon,
      })
      .select()
      .single();

    setCreating(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Transaction added!");
      if (data) {
        setTransactions((prev) => [data, ...prev]);
        if (budgetId !== "none") {
          setBudgets((prev) =>
            prev.map((b) =>
              b.id === budgetId ? { ...b, spent: Number(b.spent) + Math.abs(finalAmount) } : b
            )
          );
        }
      }
      setOpen(false);
      setTitle("");
      setMerchant("");
      setAmount("");
      setBudgetId("none");
    }
  };

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (category !== "All" && t.category !== category) return false;
      if (type === "Income" && Number(t.amount) <= 0) return false;
      if (type === "Expense" && Number(t.amount) > 0) return false;
      if (query && !`${t.title} ${t.merchant} ${t.category}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [transactions, query, category, type]);

  const totals = useMemo(() => {
    const income = filtered.filter((t) => Number(t.amount) > 0).reduce((s, t) => s + Number(t.amount), 0);
    const expense = filtered.filter((t) => Number(t.amount) < 0).reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
    return { income, expense, net: income - expense, count: filtered.length };
  }, [filtered]);

  const grouped = groupByDate(filtered);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background" style={{ background: "var(--gradient-paper)" }}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Lucide.Sprout className="h-7 w-7 text-success animate-pulse" />
          </div>
          <p className="font-serif text-lg font-bold text-foreground">Loading ledger records…</p>
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
              <span className="text-foreground">Transactions</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
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
                  <Lucide.Download className="mr-1.5 h-4 w-4" /> Export CSV
                </Button>
                <Button onClick={() => setOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft">
                  <Lucide.Plus className="mr-1.5 h-4 w-4" /> Add transaction
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
                  <Lucide.ArrowUpRight className="h-5 w-5" />${totals.income.toFixed(2)}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Expenses</p>
                <p className="mt-2 flex items-center gap-1 font-serif text-2xl font-bold tabular-nums text-foreground">
                  <Lucide.ArrowDownRight className="h-5 w-5 text-warning" />${totals.expense.toFixed(2)}
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
                  <Lucide.Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                const dayTotal = rows.reduce((s, r) => s + Number(r.amount), 0);
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
                      const amountNum = Number(t.amount);
                      const positive = amountNum > 0;
                      const IconComponent = iconMap[t.icon] || Lucide.Sparkles;
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
                              <IconComponent className="h-4.5 w-4.5" />
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
                            {positive ? "+" : "−"}${Math.abs(amountNum).toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-border px-6 py-4 text-xs text-muted-foreground">
                <span>Showing {totals.count} of {transactions.length} transactions</span>
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

      {/* Add Transaction Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleCreateTransaction}>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Record a transaction</DialogTitle>
              <DialogDescription>
                Document an outflow or inflow of funds to keep your ledger balanced.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right text-xs uppercase tracking-wider text-muted-foreground">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Weekly groceries"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="merchant" className="text-right text-xs uppercase tracking-wider text-muted-foreground">Merchant</Label>
                <Input
                  id="merchant"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder="FreshMart"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right text-xs uppercase tracking-wider text-muted-foreground">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="85.70"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right text-xs uppercase tracking-wider text-muted-foreground">Category</Label>
                <Select value={newTxCategory} onValueChange={setNewTxCategory}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter(c => c !== "All").map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="method" className="text-right text-xs uppercase tracking-wider text-muted-foreground">Method</Label>
                <Select value={method} onValueChange={(v) => setMethod(v as any)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Card", "Cash", "Transfer"].map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right text-xs uppercase tracking-wider text-muted-foreground">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              {newTxCategory !== "Income" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="budget" className="text-right text-xs uppercase tracking-wider text-muted-foreground">Envelope</Label>
                  <Select value={budgetId} onValueChange={setBudgetId}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Link to budget envelope" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {budgets.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={creating} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {creating ? "Adding..." : "Add Transaction"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Transactions;
