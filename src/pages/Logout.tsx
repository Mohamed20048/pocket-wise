import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sprout, ArrowRight, Leaf, Moon, LogIn } from "lucide-react";
import { supabase } from "@/lib/supabase";

const Logout = () => {
  const [stage, setStage] = useState<"confirm" | "farewell">("confirm");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (stage !== "farewell") return;
    const start = Date.now();
    const id = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / 1400) * 100);
      setProgress(p);
      if (p >= 100) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [stage]);

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-4 py-10">
      {/* Ambient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{ background: "var(--gradient-paper)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-32 h-[28rem] w-[28rem] rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--gradient-walnut)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-24 h-[24rem] w-[24rem] rounded-full bg-success/20 blur-3xl"
      />

      {/* Floating leaves */}
      {[...Array(6)].map((_, i) => (
        <Leaf
          key={i}
          aria-hidden
          className="pointer-events-none absolute text-success/25"
          style={{
            top: `${10 + i * 13}%`,
            left: `${(i * 17) % 90}%`,
            width: `${14 + (i % 3) * 6}px`,
            height: `${14 + (i % 3) * 6}px`,
            transform: `rotate(${i * 47}deg)`,
          }}
        />
      ))}

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-leaf">
            <Sprout className="h-5 w-5" />
          </div>
          <div className="leading-tight text-center">
            <p className="font-serif text-base font-bold text-foreground">Grove Ledger</p>
            <p className="text-[11px] text-muted-foreground">Mindful finance</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-leaf md:p-10">
          {stage === "confirm" ? (
            <>
              <p className="text-center text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Sign out
              </p>
              <h1 className="mt-3 text-center font-serif text-3xl font-bold tracking-tight text-foreground md:text-[2.1rem]">
                Resting the grove?
              </h1>
              <p className="mx-auto mt-3 max-w-sm text-center text-sm text-muted-foreground leading-relaxed">
                Your saplings keep growing while you're away. We'll save your place and quietly close
                this session.
              </p>

              {/* Mini snapshot */}
              <div className="mt-7 grid grid-cols-3 gap-3 rounded-xl bg-secondary/60 p-4">
                {[
                  { label: "Tracked", value: "127" },
                  { label: "Saplings", value: "4" },
                  { label: "Streak", value: "21d" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="font-serif text-xl font-bold text-foreground tabular-nums">
                      {s.value}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex flex-col gap-2.5">
                <Button
                  className="h-11 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setStage("farewell");
                  }}
                >
                  Sign me out
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button asChild variant="ghost" className="h-10 text-muted-foreground hover:text-foreground">
                  <Link to="/">Stay signed in</Link>
                </Button>
              </div>

              <p className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <Moon className="h-3 w-3" />
                Your data stays encrypted at rest.
              </p>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center text-center">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                  <Leaf className="h-7 w-7 text-success" />
                  <span className="absolute inset-0 animate-ping rounded-full bg-success/30" />
                </div>
                <p className="mt-5 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Until next time
                </p>
                <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground">
                  Tend gently, Omar.
                </h1>
                <p className="mt-3 max-w-sm text-sm text-muted-foreground leading-relaxed">
                  Money is only a tool. Today you used it with intention — that's the whole practice.
                </p>
              </div>

              {/* Progress sapling */}
              <div className="mt-7">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gradient-walnut transition-[width] duration-100 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  {progress < 100 ? "Closing your session…" : "Session closed safely."}
                </p>
              </div>

              <div className="mt-7 flex flex-col gap-2.5">
                <Button
                  asChild
                  disabled={progress < 100}
                  className="h-11 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  <Link to="/">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign back in
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="h-10 text-muted-foreground hover:text-foreground">
                  <Link to="/">Return to dashboard</Link>
                </Button>
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          © Grove Ledger · Designed for calm decisions
        </p>
      </div>
    </div>
  );
};

export default Logout;
