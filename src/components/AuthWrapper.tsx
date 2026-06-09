import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sprout, Leaf, Lock, Mail, User, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Sign In Form States
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInLoading, setSignInLoading] = useState(false);

  // Sign Up Form States
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpFullName, setSignUpFullName] = useState("");
  const [signUpDisplayName, setSignUpDisplayName] = useState("");
  const [signUpLoading, setSignUpLoading] = useState(false);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail || !signInPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    setSignInLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: signInEmail,
      password: signInPassword,
    });

    setSignInLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back to your grove!");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpEmail || !signUpPassword || !signUpDisplayName) {
      toast.error("Email, password, and display name are required.");
      return;
    }

    setSignUpLoading(true);
    const { error } = await supabase.auth.signUp({
      email: signUpEmail,
      password: signUpPassword,
      options: {
        data: {
          full_name: signUpFullName || signUpDisplayName,
          display_name: signUpDisplayName,
        },
      },
    });

    setSignUpLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created successfully! Welcome to the grove.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background" style={{ background: "var(--gradient-paper)" }}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Sprout className="h-7 w-7 text-success animate-pulse" />
          </div>
          <p className="font-serif text-lg font-bold text-foreground">Tending the grove…</p>
        </div>
      </div>
    );
  }

  if (!session) {
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
        {[...Array(5)].map((_, i) => (
          <Leaf
            key={i}
            aria-hidden
            className="pointer-events-none absolute text-success/15"
            style={{
              top: `${15 + i * 18}%`,
              left: `${(i * 23) % 85}%`,
              width: `${12 + (i % 3) * 6}px`,
              height: `${12 + (i % 3) * 6}px`,
              transform: `rotate(${i * 63}deg)`,
            }}
          />
        ))}

        <div className="relative w-full max-w-md">
          {/* Brand */}
          <div className="mb-6 flex items-center justify-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-leaf">
              <Sprout className="h-6 w-6" />
            </div>
            <div className="leading-tight">
              <p className="font-serif text-lg font-bold text-foreground">Grove Ledger</p>
              <p className="text-[11px] text-muted-foreground uppercase tracking-widest">Mindful finance</p>
            </div>
          </div>

          <Card className="border border-border bg-card/95 backdrop-blur-sm shadow-leaf">
            <CardHeader className="text-center pb-4">
              <CardTitle className="font-serif text-3xl font-bold text-foreground">Enter the Grove</CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1.5">
                Seed your intentions, watch your investments grow.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {/* Sign In Form */}
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-xs uppercase tracking-wider text-muted-foreground">Email address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="omar@grove.app"
                          value={signInEmail}
                          onChange={(e) => setSignInEmail(e.target.value)}
                          className="pl-10 bg-background border-border"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-xs uppercase tracking-wider text-muted-foreground">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="signin-password"
                          type="password"
                          placeholder="••••••••"
                          value={signInPassword}
                          onChange={(e) => setSignInPassword(e.target.value)}
                          className="pl-10 bg-background border-border"
                          required
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={signInLoading}
                      className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 mt-2 shadow-soft font-serif"
                    >
                      {signInLoading ? "Opening ledger…" : "Sign In to Ledger"}
                    </Button>
                  </form>
                </TabsContent>

                {/* Sign Up Form */}
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="signup-display" className="text-xs uppercase tracking-wider text-muted-foreground">Display Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="signup-display"
                            placeholder="Omar"
                            value={signUpDisplayName}
                            onChange={(e) => setSignUpDisplayName(e.target.value)}
                            className="pl-10 bg-background border-border"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-full" className="text-xs uppercase tracking-wider text-muted-foreground">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="signup-full"
                            placeholder="Omar Saad"
                            value={signUpFullName}
                            onChange={(e) => setSignUpFullName(e.target.value)}
                            className="pl-10 bg-background border-border"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-xs uppercase tracking-wider text-muted-foreground">Email address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="omar@grove.app"
                          value={signUpEmail}
                          onChange={(e) => setSignUpEmail(e.target.value)}
                          className="pl-10 bg-background border-border"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-xs uppercase tracking-wider text-muted-foreground">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="At least 6 characters"
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          className="pl-10 bg-background border-border"
                          required
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={signUpLoading}
                      className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 mt-2 shadow-soft font-serif"
                    >
                      {signUpLoading ? "Planting account…" : "Create Seed Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col text-center pt-2 pb-6 border-t border-border/40 mt-4">
              <p className="flex items-center gap-1 text-[11px] text-muted-foreground mt-2">
                <Sparkles className="h-3 w-3 text-warning" />
                Slow, steady, seasonal. Financial mindfulness.
              </p>
            </CardFooter>
          </Card>
          <p className="mt-6 text-center text-[11px] text-muted-foreground">
            © Grove Ledger · Cultivating mindful financial habits
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
