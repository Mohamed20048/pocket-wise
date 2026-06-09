import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Sprout } from "lucide-react";
import {
  Bell,
  Search,
  User,
  Palette,
  Shield,
  CreditCard,
  Database,
  Leaf,
  Mail,
  Smartphone,
  Globe,
  KeyRound,
  Download,
  Trash2,
  Check,
  Sun,
  Moon,
  Sprout,
} from "lucide-react";

type SectionId = "profile" | "preferences" | "notifications" | "security" | "billing" | "data";

const sections: { id: SectionId; title: string; icon: typeof User; hint: string }[] = [
  { id: "profile", title: "Profile", icon: User, hint: "Your name & avatar" },
  { id: "preferences", title: "Preferences", icon: Palette, hint: "Theme, currency, locale" },
  { id: "notifications", title: "Notifications", icon: Bell, hint: "Gentle nudges" },
  { id: "security", title: "Security", icon: Shield, hint: "Password & sessions" },
  { id: "billing", title: "Plan", icon: CreditCard, hint: "Subscription tier" },
  { id: "data", title: "Data garden", icon: Database, hint: "Export or prune" },
];

const palettes = [
  { id: "paper", label: "Paper", swatches: ["#EFE8D8", "#3E342A", "#7AA17C"] },
  { id: "moss", label: "Moss", swatches: ["#E5E8DA", "#2F3A2A", "#8AA66B"] },
  { id: "clay", label: "Clay", swatches: ["#F1E2D0", "#5A3A2C", "#C68A5A"] },
];

const Settings = () => {
  const [active, setActive] = useState<SectionId>("profile");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [palette, setPalette] = useState("paper");
  const [notif, setNotif] = useState({
    weekly: true,
    overspend: true,
    goals: true,
    product: false,
    sms: false,
  });

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  
  // Profile settings inputs
  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [timezone, setTimezone] = useState("");
  const [bio, setBio] = useState("");
  
  // Preference settings inputs
  const [currency, setCurrency] = useState("EGP");
  const [numberFormat, setNumberFormat] = useState("1,234.56");
  const [weekStartsOn, setWeekStartsOn] = useState("Saturday");
  const [language, setLanguage] = useState("English");
  const [roundTransactions, setRoundTransactions] = useState(false);
  const [showMicroInsights, setShowMicroInsights] = useState(true);

  // Security password fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityLoading, setSecurityLoading] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email || "");

      // 1. Load Profile
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (prof) {
        setProfile(prof);
        setFullName(prof.full_name || "");
        setDisplayName(prof.display_name || "");
        setBio(prof.bio || "");
      }

      // 2. Load Settings
      const { data: setts } = await supabase.from('settings').select('*').eq('id', user.id).single();
      if (setts) {
        setTheme(setts.theme as any);
        setPalette(setts.palette);
        setCurrency(setts.currency);
        setNumberFormat(setts.number_format);
        setWeekStartsOn(setts.week_starts_on);
        setLanguage(setts.language);
        setRoundTransactions(setts.round_transactions);
        setShowMicroInsights(setts.show_micro_spending_insights);
        setNotif({
          weekly: setts.notif_weekly,
          overspend: setts.notif_overspend,
          goals: setts.notif_goals,
          product: setts.notif_product,
          sms: setts.notif_sms,
        });
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleSaveAll = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Update Profile
    const { error: profError } = await supabase.from('profiles').update({
      full_name: fullName,
      display_name: displayName,
      bio: bio
    }).eq('id', user.id);

    // Update Settings
    const { error: settError } = await supabase.from('settings').update({
      theme: theme,
      palette: palette,
      currency: currency,
      number_format: numberFormat,
      week_starts_on: weekStartsOn,
      language: language,
      round_transactions: roundTransactions,
      show_micro_spending_insights: showMicroInsights,
      notif_weekly: notif.weekly,
      notif_overspend: notif.overspend,
      notif_goals: notif.goals,
      notif_product: notif.product,
      notif_sms: notif.sms
    }).eq('id', user.id);

    if (profError || settError) {
      toast.error(profError?.message || settError?.message || "Failed to save settings");
    } else {
      toast.success("Settings saved successfully!");
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      toast.error("Passwords do not match or are empty.");
      return;
    }
    setSecurityLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSecurityLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("Are you absolutely sure you want to delete your account? This will permanently delete your profile, budgets, goals, and transactions. This action CANNOT be undone.");
    if (!confirmDelete) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('profiles').delete().eq('id', user.id);
    if (error) {
      toast.error(error.message);
    } else {
      await supabase.auth.signOut();
      toast.success("Account deleted successfully.");
    }
  };

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
              <span className="text-foreground">Settings</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground w-64">
                <Search className="h-3.5 w-3.5" />
                <span>Search settings…</span>
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
            {/* Heading */}
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Tend · Configure
                </p>
                <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-foreground md:text-[2.6rem]">
                  Settings
                </h1>
                <p className="mt-2 text-sm text-muted-foreground max-w-xl">
                  Shape Grove Ledger to your rhythm — quiet defaults, mindful nudges, your data on your terms.
                </p>
              </div>
              <Button onClick={handleSaveAll} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Check className="mr-2 h-4 w-4" />
                Save changes
              </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
              {/* Section nav */}
              <aside className="lg:sticky lg:top-24 self-start">
                <nav className="rounded-xl border border-border bg-card p-2 shadow-soft">
                  {sections.map((s) => {
                    const isActive = s.id === active;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setActive(s.id)}
                        className={`group flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors ${
                          isActive
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <s.icon className={`mt-0.5 h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                        <div className="leading-tight">
                          <p className="text-sm font-medium">{s.title}</p>
                          <p className="text-[11px] text-muted-foreground">{s.hint}</p>
                        </div>
                      </button>
                    );
                  })}
                </nav>

                <div className="mt-4 rounded-xl border border-border bg-gradient-paper p-4 shadow-soft">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-success" />
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      Mindful tip
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-foreground/80 leading-relaxed">
                    Fewer notifications. Calmer decisions. Choose only what you'll act on.
                  </p>
                </div>
              </aside>

              {/* Section content */}
              <section className="space-y-6">
                {active === "profile" && (
                  <Card title="Profile" subtitle="How you appear inside the grove.">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="h-20 w-20 rounded-full bg-gradient-walnut text-primary-foreground font-serif text-2xl font-bold flex items-center justify-center shadow-leaf">
                          OS
                        </div>
                        <button className="absolute -bottom-1 -right-1 rounded-full bg-card border border-border p-1.5 text-muted-foreground hover:text-foreground">
                          <Sprout className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div>
                        <p className="font-serif text-lg font-bold text-foreground">Omar Saad</p>
                        <p className="text-xs text-muted-foreground">Joined September 2024 · Sapling member</p>
                        <Button variant="ghost" size="sm" className="mt-2 h-7 px-2 text-xs">
                          Replace photo
                        </Button>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="grid gap-5 md:grid-cols-2">
                      <Field label="Full name">
                        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                      </Field>
                      <Field label="Display name">
                        <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                      </Field>
                      <Field label="Email" icon={Mail}>
                        <Input type="email" value={email} disabled className="opacity-70 cursor-not-allowed" />
                      </Field>
                      <Field label="Timezone" icon={Globe}>
                        <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} />
                      </Field>
                      <div className="md:col-span-2">
                        <Field label="Bio">
                          <Textarea
                            rows={3}
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                          />
                        </Field>
                      </div>
                    </div>
                  </Card>
                )}

                {active === "preferences" && (
                  <>
                    <Card title="Appearance" subtitle="Light, dark, or follow your system.">
                      <div className="grid gap-3 sm:grid-cols-3">
                        {[
                          { id: "light", label: "Paper", icon: Sun },
                          { id: "dark", label: "Walnut", icon: Moon },
                          { id: "system", label: "Auto", icon: Sprout },
                        ].map((t) => {
                          const isActive = theme === t.id;
                          return (
                            <button
                              key={t.id}
                              onClick={() => setTheme(t.id as typeof theme)}
                              className={`rounded-lg border p-4 text-left transition-all ${
                                isActive
                                  ? "border-primary bg-secondary shadow-soft"
                                  : "border-border bg-card hover:border-accent"
                              }`}
                            >
                              <t.icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                              <p className="mt-3 text-sm font-medium text-foreground">{t.label}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {t.id === "light" ? "Recycled paper tone" : t.id === "dark" ? "Deep bark, low glare" : "Match device"}
                              </p>
                            </button>
                          );
                        })}
                      </div>

                      <Separator className="my-6" />

                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground mb-3">
                        Accent palette
                      </p>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {palettes.map((p) => {
                          const isActive = palette === p.id;
                          return (
                            <button
                              key={p.id}
                              onClick={() => setPalette(p.id)}
                              className={`rounded-lg border p-3 text-left transition-all ${
                                isActive ? "border-primary bg-secondary" : "border-border bg-card hover:border-accent"
                              }`}
                            >
                              <div className="flex gap-1.5">
                                {p.swatches.map((c) => (
                                  <span
                                    key={c}
                                    className="h-6 w-6 rounded-full border border-border/50"
                                    style={{ backgroundColor: c }}
                                  />
                                ))}
                              </div>
                              <p className="mt-3 text-sm font-medium text-foreground">{p.label}</p>
                            </button>
                          );
                        })}
                      </div>
                    </Card>

                    <Card title="Currency & format" subtitle="How numbers read in your ledger.">
                      <div className="grid gap-5 md:grid-cols-2">
                        <Field label="Primary currency">
                          <Input value={currency} onChange={(e) => setCurrency(e.target.value)} />
                        </Field>
                        <Field label="Number format">
                          <Input value={numberFormat} onChange={(e) => setNumberFormat(e.target.value)} />
                        </Field>
                        <Field label="Week starts on">
                          <Input value={weekStartsOn} onChange={(e) => setWeekStartsOn(e.target.value)} />
                        </Field>
                        <Field label="Language">
                          <Input value={language} onChange={(e) => setLanguage(e.target.value)} />
                        </Field>
                      </div>
                      <Separator className="my-6" />
                      <ToggleRow
                        title="Round transactions"
                        desc="Display amounts rounded to the nearest whole unit."
                        checked={roundTransactions}
                        onChange={setRoundTransactions}
                      />
                      <ToggleRow
                        title="Show micro-spending insights"
                        desc="Surface gentle observations after each week."
                        checked={showMicroInsights}
                        onChange={setShowMicroInsights}
                      />
                    </Card>
                  </>
                )}

                {active === "notifications" && (
                  <Card title="Notifications" subtitle="Quiet by default. Opt in only to what helps.">
                    <div className="space-y-1">
                      <ToggleRow
                        title="Weekly garden review"
                        desc="A short Sunday summary of inflow, outflow, and saplings."
                        icon={Mail}
                        checked={notif.weekly}
                        onChange={(v) => setNotif({ ...notif, weekly: v })}
                      />
                      <ToggleRow
                        title="Envelope overflow"
                        desc="Nudge me when a budget envelope passes 90%."
                        icon={Bell}
                        checked={notif.overspend}
                        onChange={(v) => setNotif({ ...notif, overspend: v })}
                      />
                      <ToggleRow
                        title="Goal milestones"
                        desc="Celebrate when a sapling reaches 25%, 50%, or bloom."
                        icon={Sprout}
                        checked={notif.goals}
                        onChange={(v) => setNotif({ ...notif, goals: v })}
                      />
                      <ToggleRow
                        title="Product news"
                        desc="Occasional notes about new features. Never marketing."
                        icon={Mail}
                        checked={notif.product}
                        onChange={(v) => setNotif({ ...notif, product: v })}
                      />
                      <ToggleRow
                        title="SMS alerts"
                        desc="Critical alerts only — large or unusual transactions."
                        icon={Smartphone}
                        checked={notif.sms}
                        onChange={(v) => setNotif({ ...notif, sms: v })}
                      />
                    </div>
                  </Card>
                )}

                {active === "security" && (
                  <>
                    <Card title="Password" subtitle="Change it any time. We'll keep recent sessions signed in.">
                      <div className="grid gap-5 md:grid-cols-2">
                        <div className="hidden md:block" />
                        <Field label="New password">
                          <Input type="password" placeholder="At least 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                        </Field>
                        <Field label="Confirm new password">
                          <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        </Field>
                      </div>
                      <Button onClick={handleUpdatePassword} disabled={securityLoading} className="mt-5 bg-primary text-primary-foreground hover:bg-primary/90">
                        {securityLoading ? "Updating..." : "Update password"}
                      </Button>
                    </Card>

                    <Card title="Two-factor authentication" subtitle="Add a second layer to your grove.">
                      <ToggleRow
                        title="Authenticator app"
                        desc="Use 1Password, Authy, or Google Authenticator."
                        defaultChecked
                      />
                      <ToggleRow
                        title="Backup codes"
                        desc="Generate ten one-time codes to keep offline."
                        defaultChecked={false}
                      />
                    </Card>

                    <Card title="Active sessions" subtitle="Devices currently signed in to your account.">
                      <div className="divide-y divide-border">
                        {[
                          { device: "MacBook Air · Safari", where: "Cairo, EG · current", current: true },
                          { device: "iPhone 14 · Grove app", where: "Cairo, EG · 2h ago" },
                          { device: "Chrome · Windows", where: "Alexandria, EG · 4d ago" },
                        ].map((s) => (
                          <div key={s.device} className="flex items-center justify-between py-3">
                            <div>
                              <p className="text-sm font-medium text-foreground">{s.device}</p>
                              <p className="text-xs text-muted-foreground">{s.where}</p>
                            </div>
                            {s.current ? (
                              <span className="text-[11px] uppercase tracking-[0.14em] text-success">
                                This device
                              </span>
                            ) : (
                              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-destructive">
                                Sign out
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </Card>
                  </>
                )}

                {active === "billing" && (
                  <Card title="Your plan" subtitle="A grove that grows with you.">
                    <div className="rounded-lg bg-gradient-walnut p-5 text-primary-foreground shadow-leaf">
                      <p className="text-[11px] uppercase tracking-[0.18em] opacity-70">Current plan</p>
                      <p className="mt-2 font-serif text-2xl font-bold">Sapling · Free</p>
                      <p className="mt-1 text-sm opacity-80">
                        Unlimited transactions, 4 budgets, 2 goals. Perfect to start.
                      </p>
                    </div>

                    <Separator className="my-6" />

                    <div className="grid gap-4 md:grid-cols-2">
                      {[
                        {
                          name: "Sapling",
                          price: "Free",
                          features: ["Unlimited transactions", "4 envelopes", "2 goals"],
                          current: true,
                        },
                        {
                          name: "Grove",
                          price: "$4 / mo",
                          features: ["Unlimited everything", "Bank sync", "Reports & exports"],
                        },
                      ].map((p) => (
                        <div
                          key={p.name}
                          className={`rounded-lg border p-4 ${
                            p.current ? "border-primary bg-secondary" : "border-border bg-card"
                          }`}
                        >
                          <div className="flex items-baseline justify-between">
                            <p className="font-serif text-lg font-bold text-foreground">{p.name}</p>
                            <p className="text-sm font-medium text-foreground tabular-nums">{p.price}</p>
                          </div>
                          <ul className="mt-3 space-y-1.5">
                            {p.features.map((f) => (
                              <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Check className="h-3 w-3 text-success" />
                                {f}
                              </li>
                            ))}
                          </ul>
                          <Button
                            variant={p.current ? "ghost" : "default"}
                            size="sm"
                            disabled={p.current}
                            className="mt-4 w-full"
                          >
                            {p.current ? "Current plan" : "Upgrade"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {active === "data" && (
                  <>
                    <Card title="Export your garden" subtitle="Take your data anywhere — it's always yours.">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Button variant="outline" className="justify-start h-auto py-3">
                          <Download className="mr-3 h-4 w-4" />
                          <div className="text-left">
                            <p className="text-sm font-medium">CSV export</p>
                            <p className="text-[11px] text-muted-foreground">All transactions & budgets</p>
                          </div>
                        </Button>
                        <Button variant="outline" className="justify-start h-auto py-3">
                          <Download className="mr-3 h-4 w-4" />
                          <div className="text-left">
                            <p className="text-sm font-medium">JSON archive</p>
                            <p className="text-[11px] text-muted-foreground">Full account snapshot</p>
                          </div>
                        </Button>
                      </div>
                    </Card>

                    <Card title="Prune the garden" subtitle="Permanent actions. Take a breath first.">
                      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                        <div className="flex items-start gap-3">
                          <Trash2 className="mt-0.5 h-4 w-4 text-destructive" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">Delete account</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Erase your profile, transactions, budgets, and goals. This cannot be undone.
                            </p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </>
                )}
              </section>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

/* ---------- helpers ---------- */

const Card = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-xl border border-border bg-card p-6 shadow-soft md:p-7">
    <div className="mb-5">
      <h2 className="font-serif text-xl font-bold text-foreground">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const Field = ({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: typeof Mail;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <Label className="flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-muted-foreground">
      {Icon && <Icon className="h-3 w-3" />}
      {label}
    </Label>
    {children}
  </div>
);

const ToggleRow = ({
  title,
  desc,
  icon: Icon,
  checked,
  defaultChecked,
  onChange,
}: {
  title: string;
  desc: string;
  icon?: typeof Bell;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (v: boolean) => void;
}) => (
  <div className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
    <div className="flex items-start gap-3">
      {Icon && (
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
    <Switch checked={checked} defaultChecked={defaultChecked} onCheckedChange={onChange} />
  </div>
);

export default Settings;
