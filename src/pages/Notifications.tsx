import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Bell,
  BellOff,
  CheckCheck,
  Filter,
  Sprout,
  Leaf,
  TrendingDown,
  TrendingUp,
  Target,
  AlertTriangle,
  Wallet,
  Users,
  Settings as SettingsIcon,
  Trash2,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";

type Tone = "success" | "warning" | "destructive" | "accent" | "primary";
type Category = "all" | "saplings" | "budgets" | "transactions" | "system";

interface Notice {
  id: string;
  category: Exclude<Category, "all">;
  icon: typeof Sprout;
  tone: Tone;
  title: string;
  body: string;
  time: string;
  read: boolean;
  pinned?: boolean;
}

const seed: Notice[] = [
  {
    id: "n1",
    category: "saplings",
    icon: Sprout,
    tone: "success",
    title: "Emergency fund bloomed",
    body: "Your emergency sapling reached 100% of its $6,000 target. Time to plant the next.",
    time: "12m ago",
    read: false,
    pinned: true,
  },
  {
    id: "n2",
    category: "budgets",
    icon: AlertTriangle,
    tone: "warning",
    title: "Groceries budget at 86%",
    body: "$432 of $500 spent this month. 9 days remain before reset.",
    time: "1h ago",
    read: false,
  },
  {
    id: "n3",
    category: "transactions",
    icon: TrendingDown,
    tone: "destructive",
    title: "Unusual outflow detected",
    body: "$248.00 at Northwind Hardware — larger than your typical spend in this category.",
    time: "3h ago",
    read: false,
  },
  {
    id: "n4",
    category: "transactions",
    icon: TrendingUp,
    tone: "success",
    title: "Payday landed",
    body: "$3,420.00 from Mossbark Studio cleared and was sorted into your ledger.",
    time: "Today, 8:02 AM",
    read: true,
  },
  {
    id: "n5",
    category: "saplings",
    icon: Target,
    tone: "accent",
    title: "Travel sapling watered",
    body: "Recurring contribution of $150 added to your Kyoto fund.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "n6",
    category: "budgets",
    icon: Leaf,
    tone: "success",
    title: "Dining within bounds",
    body: "Closed last week 18% under your dining allowance. Steady hand.",
    time: "2d ago",
    read: true,
  },
  {
    id: "n7",
    category: "system",
    icon: Users,
    tone: "primary",
    title: "New device signed in",
    body: "iPad · Portland, OR. If this wasn't you, prune the session in Settings.",
    time: "3d ago",
    read: true,
  },
  {
    id: "n8",
    category: "system",
    icon: Wallet,
    tone: "primary",
    title: "Account synced",
    body: "Mossbark Credit Union finished its weekly reconciliation. 24 new entries.",
    time: "5d ago",
    read: true,
  },
];

const categories: { id: Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "saplings", label: "Saplings" },
  { id: "budgets", label: "Budgets" },
  { id: "transactions", label: "Ledger" },
  { id: "system", label: "System" },
];

const toneClasses: Record<Tone, string> = {
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  destructive: "bg-destructive/15 text-destructive border-destructive/30",
  accent: "bg-accent/15 text-accent border-accent/30",
  primary: "bg-primary/10 text-primary border-primary/20",
};

export default function Notifications() {
  const [items, setItems] = useState<Notice[]>(seed);
  const [filter, setFilter] = useState<Category>("all");
  const [query, setQuery] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const filtered = useMemo(() => {
    return items.filter((n) => {
      if (filter !== "all" && n.category !== filter) return false;
      if (unreadOnly && n.read) return false;
      if (query && !`${n.title} ${n.body}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [items, filter, unreadOnly, query]);

  const unreadCount = items.filter((n) => !n.read).length;
  const pinned = filtered.filter((n) => n.pinned);
  const rest = filtered.filter((n) => !n.pinned);

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  const clearAll = () => setItems([]);
  const toggleRead = (id: string) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
  const remove = (id: string) => setItems((prev) => prev.filter((n) => n.id !== id));

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full" style={{ background: "var(--gradient-paper)" }}>
        <AppSidebar />

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background/85 px-4 backdrop-blur md:px-8">
            <SidebarTrigger className="text-muted-foreground" />
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
              <span>Grove</span>
              <span>/</span>
              <span className="text-foreground">Notifications</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Bell className="h-4 w-4" />
              </Button>
              <Link
                to="/profile"
                aria-label="Open profile"
                className="h-8 w-8 rounded-full bg-gradient-walnut text-primary-foreground flex items-center justify-center text-xs font-semibold transition hover:ring-2 hover:ring-ring hover:ring-offset-2 hover:ring-offset-background"
              >
                OS
              </Link>
            </div>
          </header>

          <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 md:px-8 md:py-10">
            {/* Heading */}
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Whispers from the grove</p>
                <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-foreground md:text-[2.6rem]">
                  Notifications
                </h1>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  {unreadCount > 0
                    ? `${unreadCount} fresh ${unreadCount === 1 ? "note" : "notes"} waiting for your attention.`
                    : "All caught up. The grove is quiet."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="border-border bg-card hover:bg-secondary"
                  onClick={markAllRead}
                  disabled={unreadCount === 0}
                >
                  <CheckCheck className="mr-1.5 h-4 w-4" /> Mark all read
                </Button>
                <Button
                  variant="outline"
                  className="border-border bg-card text-destructive hover:bg-destructive/10"
                  onClick={clearAll}
                  disabled={items.length === 0}
                >
                  <Trash2 className="mr-1.5 h-4 w-4" /> Clear
                </Button>
              </div>
            </div>

            {/* Filter bar */}
            <div
              className="mb-6 rounded-xl border border-border/60 bg-card p-3"
              style={{ boxShadow: "var(--shadow-soft)" }}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((c) => {
                    const count =
                      c.id === "all"
                        ? items.length
                        : items.filter((n) => n.category === c.id).length;
                    const active = filter === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setFilter(c.id)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground",
                        )}
                      >
                        {c.label}
                        <span
                          className={cn(
                            "rounded-full px-1.5 text-[10px] tabular-nums",
                            active ? "bg-primary-foreground/15" : "bg-muted",
                          )}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search whispers"
                      className="h-9 w-44 border-border/60 bg-background/60 pl-8 text-sm"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Switch checked={unreadOnly} onCheckedChange={setUnreadOnly} />
                    Unread
                  </label>
                </div>
              </div>
            </div>

            {/* List */}
            {filtered.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-6">
                {pinned.length > 0 && (
                  <Section label="Pinned">
                    {pinned.map((n) => (
                      <Row key={n.id} n={n} onToggle={toggleRead} onRemove={remove} />
                    ))}
                  </Section>
                )}
                <Section label={pinned.length > 0 ? "Earlier" : "Recent"}>
                  {rest.map((n) => (
                    <Row key={n.id} n={n} onToggle={toggleRead} onRemove={remove} />
                  ))}
                </Section>
              </div>
            )}

            {/* Preferences hint */}
            <div
              className="mt-10 flex flex-col items-start gap-3 rounded-xl border border-dashed border-border p-5 md:flex-row md:items-center md:justify-between"
              style={{ background: "var(--gradient-walnut)" }}
            >
              <div className="flex items-start gap-3 text-primary-foreground">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-foreground/10">
                  <SettingsIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-serif text-base font-bold">Tune the chimes</p>
                  <p className="text-xs text-primary-foreground/70">
                    Choose which moments deserve a whisper, and which can rest.
                  </p>
                </div>
              </div>
              <Button asChild variant="secondary" className="bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20">
                <Link to="/settings">Notification preferences</Link>
              </Button>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-3">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <Separator className="flex-1 bg-border/60" />
      </div>
      <div
        className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-card"
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        {children}
      </div>
    </section>
  );
}

function Row({
  n,
  onToggle,
  onRemove,
}: {
  n: Notice;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const Icon = n.icon;
  return (
    <article
      className={cn(
        "group relative flex gap-3 px-4 py-4 transition hover:bg-secondary/40 md:px-5",
        !n.read && "bg-secondary/30",
      )}
    >
      {!n.read && (
        <span className="absolute left-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-primary" />
      )}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border",
          toneClasses[n.tone],
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className={cn("truncate text-sm text-foreground", !n.read && "font-semibold")}>
              {n.title}
              {n.pinned && (
                <Badge className="ml-2 border-warning/30 bg-warning/15 text-[10px] uppercase tracking-wider text-warning hover:bg-warning/15">
                  Pinned
                </Badge>
              )}
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
          </div>
          <span className="shrink-0 text-[11px] uppercase tracking-wider text-muted-foreground">
            {n.time}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => onToggle(n.id)}
          >
            {n.read ? <BellOff className="mr-1 h-3 w-3" /> : <CheckCheck className="mr-1 h-3 w-3" />}
            {n.read ? "Mark unread" : "Mark read"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(n.id)}
          >
            <Trash2 className="mr-1 h-3 w-3" /> Dismiss
          </Button>
        </div>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center"
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <Filter className="h-5 w-5" />
      </div>
      <p className="font-serif text-lg font-bold text-foreground">Nothing matches</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Try a different filter, or clear your search to see the whole grove.
      </p>
    </div>
  );
}
