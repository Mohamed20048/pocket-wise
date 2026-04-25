import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Sprout,
  Leaf,
  TreePine,
  MapPin,
  Mail,
  Calendar,
  Pencil,
  Camera,
  Award,
  TrendingUp,
  Target,
  Flame,
} from "lucide-react";

const stats = [
  { label: "Saplings tended", value: "12", icon: Sprout, tone: "text-success" },
  { label: "Goals bloomed", value: "4", icon: Target, tone: "text-warning" },
  { label: "Day streak", value: "47", icon: Flame, tone: "text-destructive" },
  { label: "Net growth", value: "+18%", icon: TrendingUp, tone: "text-accent" },
];

const milestones = [
  { title: "Planted first sapling", date: "Mar 2024", icon: Sprout },
  { title: "First goal bloomed", date: "Jul 2024", icon: Leaf },
  { title: "30-day streak", date: "Sep 2024", icon: Flame },
  { title: "Grove of ten", date: "Jan 2025", icon: TreePine },
];

const badges = [
  { label: "Mindful saver", tone: "bg-success/15 text-success border-success/30" },
  { label: "Goal grower", tone: "bg-warning/15 text-warning border-warning/30" },
  { label: "Steady hand", tone: "bg-accent/15 text-accent border-accent/30" },
  { label: "Early planter", tone: "bg-primary/10 text-primary border-primary/20" },
];

export default function Profile() {
  const [editing, setEditing] = useState(false);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full" style={{ background: "var(--gradient-paper)" }}>
        <AppSidebar />
        <SidebarInset className="bg-transparent">
          <header className="flex h-14 items-center gap-3 border-b border-border/60 px-4">
            <SidebarTrigger />
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Tender · Profile
              </span>
              <h1 className="font-serif text-lg font-bold text-foreground">Your grove keeper</h1>
            </div>
          </header>

          <main className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-8">
            {/* Hero card */}
            <section
              className="relative overflow-hidden rounded-xl border border-border/60 p-6 md:p-8"
              style={{ background: "var(--gradient-walnut)", boxShadow: "var(--shadow-leaf)" }}
            >
              <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "var(--grain)", backgroundSize: "4px 4px" }} />
              <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <Avatar className="h-20 w-20 border-2 border-primary-foreground/20 shadow-lg md:h-24 md:w-24">
                      <AvatarImage src="" alt="Eleanor Hart" />
                      <AvatarFallback className="bg-primary-foreground/10 font-serif text-2xl text-primary-foreground">
                        EH
                      </AvatarFallback>
                    </Avatar>
                    <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary-foreground text-primary shadow-md transition hover:scale-105">
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="space-y-1.5 text-primary-foreground">
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif text-2xl font-bold md:text-3xl">Eleanor Hart</h2>
                      <Badge className="border-primary-foreground/20 bg-primary-foreground/10 text-[10px] uppercase tracking-wider text-primary-foreground hover:bg-primary-foreground/15">
                        <Leaf className="mr-1 h-3 w-3" /> Tender
                      </Badge>
                    </div>
                    <p className="text-sm text-primary-foreground/70">@eleanor.grove</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs text-primary-foreground/60">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" /> Portland, OR
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" /> Joined Mar 2024
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => setEditing(!editing)}
                  variant="secondary"
                  className="bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  {editing ? "Done" : "Edit profile"}
                </Button>
              </div>
            </section>

            {/* Stats strip */}
            <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg border border-border/60 bg-card p-4"
                  style={{ boxShadow: "var(--shadow-soft)" }}
                >
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    <s.icon className={`h-3.5 w-3.5 ${s.tone}`} />
                    {s.label}
                  </div>
                  <p className="mt-2 font-serif text-2xl font-bold text-foreground tabular-nums">{s.value}</p>
                </div>
              ))}
            </section>

            <div className="grid gap-6 md:grid-cols-5">
              {/* About / Edit form */}
              <section
                className="rounded-xl border border-border/60 bg-card p-6 md:col-span-3"
                style={{ boxShadow: "var(--shadow-soft)" }}
              >
                <header className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">About</p>
                    <h3 className="font-serif text-lg font-bold text-foreground">Keeper details</h3>
                  </div>
                </header>

                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Full name" defaultValue="Eleanor Hart" editing={editing} />
                    <Field label="Display name" defaultValue="eleanor.grove" editing={editing} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Email"
                      defaultValue="eleanor@grove.co"
                      editing={editing}
                      icon={<Mail className="h-3.5 w-3.5" />}
                    />
                    <Field
                      label="Location"
                      defaultValue="Portland, OR"
                      editing={editing}
                      icon={<MapPin className="h-3.5 w-3.5" />}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      Tending philosophy
                    </Label>
                    {editing ? (
                      <Textarea
                        defaultValue="Slow, steady, seasonal. I treat money like soil — feed it, rest it, watch what grows."
                        className="min-h-[88px] resize-none border-border/60 bg-background/50"
                      />
                    ) : (
                      <p className="text-sm leading-relaxed text-foreground/80">
                        Slow, steady, seasonal. I treat money like soil — feed it, rest it, watch what grows.
                      </p>
                    )}
                  </div>

                  <Separator className="bg-border/60" />

                  <div>
                    <p className="mb-3 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      Earned badges
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {badges.map((b) => (
                        <span
                          key={b.label}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${b.tone}`}
                        >
                          <Award className="h-3 w-3" />
                          {b.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Milestones timeline */}
              <section
                className="rounded-xl border border-border/60 bg-card p-6 md:col-span-2"
                style={{ boxShadow: "var(--shadow-soft)" }}
              >
                <header className="mb-5">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Almanac</p>
                  <h3 className="font-serif text-lg font-bold text-foreground">Milestones</h3>
                </header>

                <ol className="relative space-y-5 border-l border-dashed border-border pl-5">
                  {milestones.map((m) => (
                    <li key={m.title} className="relative">
                      <span className="absolute -left-[27px] flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background">
                        <m.icon className="h-2.5 w-2.5 text-success" />
                      </span>
                      <p className="text-sm font-medium text-foreground">{m.title}</p>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{m.date}</p>
                    </li>
                  ))}
                </ol>

                <Button variant="outline" className="mt-6 w-full border-border/60 text-xs">
                  View full almanac
                </Button>
              </section>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function Field({
  label,
  defaultValue,
  editing,
  icon,
}: {
  label: string;
  defaultValue: string;
  editing: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</Label>
      {editing ? (
        <Input defaultValue={defaultValue} className="border-border/60 bg-background/50" />
      ) : (
        <p className="flex items-center gap-2 text-sm text-foreground/90">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          {defaultValue}
        </p>
      )}
    </div>
  );
}
