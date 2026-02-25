import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Puzzle, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTeacherAuth } from "@/hooks/useTeacherAuth";

// ─── Demo credentials (visible to teachers on the page) ───────────────────────
const DEMO_EMAIL = "demo.teacher@puzzle.com";
const DEMO_PASSWORD = "Teacher2024!";

export default function TeacherLogin() {
  const navigate = useNavigate();
  const { user, loading, signIn, signUp } = useTeacherAuth();

  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // If the teacher is already logged in, send them straight to the landing page
  useEffect(() => {
    if (!loading && user) navigate("/", { replace: true });
  }, [user, loading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setSubmitting(true);
    setError(null);
    const result = await signIn(email.trim(), password.trim());
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    }
    // Navigation is handled by the useEffect above once user state updates
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setSubmitting(true);
    setError(null);
    const result = await signUp(email.trim(), password.trim(), displayName.trim() || undefined);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(
        "Account created! Check your email to confirm your address, then sign in."
      );
      setTab("signin");
    }
  };

  // Demo account: sign in only (no auto sign-up — avoids rate limits and keeps demo as a test account)
  const handleUseDemo = async () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    const result = await signIn(DEMO_EMAIL, DEMO_PASSWORD);
    setSubmitting(false);

    if (result.error) {
      setError(
        "Demo sign-in failed. If the demo user isn't set up yet, create your own teacher account below."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        >
          <Puzzle className="h-12 w-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md space-y-5"
      >
        {/* Back link */}
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Button>

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/25">
            <Sparkles className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Teacher Portal</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to create and manage puzzle game sessions
          </p>
        </div>

        {/* Demo account callout */}
        <div className="rounded-2xl border border-secondary/40 bg-secondary/8 p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-secondary">
            Demo Account
          </p>
          <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Email</span>
              <p className="font-mono font-medium text-foreground">{DEMO_EMAIL}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Password</span>
              <p className="font-mono font-medium text-foreground">{DEMO_PASSWORD}</p>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            className="w-full gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80"
            disabled={submitting}
            onClick={handleUseDemo}
          >
            {submitting ? "Signing in…" : "Use Demo Account →"}
          </Button>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Direct sign-in for testing. Other teachers can create their own account below.
          </p>
        </div>

        {/* Auth tabs */}
        <Card className="shadow-lg">
          {/* Tab switcher */}
          <div className="flex border-b">
            {(["signin", "signup"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setError(null); setSuccess(null); }}
                className={[
                  "flex-1 py-3 text-sm font-medium transition-colors",
                  tab === t
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {t === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === "signin" ? (
              <motion.div
                key="signin"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.18 }}
              >
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Welcome back</CardTitle>
                  <CardDescription className="text-xs">
                    Sign in with your teacher account to continue.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <label htmlFor="si-email" className="mb-1.5 block text-sm font-medium">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="si-email"
                          type="email"
                          placeholder="you@school.edu"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-9"
                          autoComplete="email"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="si-password" className="mb-1.5 block text-sm font-medium">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="si-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-9 pr-10"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {error}
                      </p>
                    )}
                    {success && (
                      <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
                        {success}
                      </p>
                    )}

                    <Button
                      type="submit"
                      className="w-full gap-2"
                      disabled={!email.trim() || !password.trim() || submitting}
                    >
                      {submitting ? "Signing in…" : "Sign In"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.18 }}
              >
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Create a teacher account</CardTitle>
                  <CardDescription className="text-xs">
                    Register with your school email to manage game sessions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                      <label htmlFor="su-name" className="mb-1.5 block text-sm font-medium">
                        Your Name <span className="text-muted-foreground">(optional)</span>
                      </label>
                      <Input
                        id="su-name"
                        placeholder="e.g. Ms. Rivera"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        autoFocus
                      />
                    </div>

                    <div>
                      <label htmlFor="su-email" className="mb-1.5 block text-sm font-medium">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="su-email"
                          type="email"
                          placeholder="you@school.edu"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-9"
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="su-password" className="mb-1.5 block text-sm font-medium">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="su-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Min. 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-9 pr-10"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {error}
                      </p>
                    )}
                    {success && (
                      <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
                        {success}
                      </p>
                    )}

                    <Button
                      type="submit"
                      className="w-full gap-2"
                      disabled={!email.trim() || !password.trim() || submitting}
                    >
                      {submitting ? "Creating account…" : "Create Account"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Students don't need an account —{" "}
          <button
            type="button"
            className="underline hover:text-foreground"
            onClick={() => navigate("/")}
          >
            join a game here
          </button>
          .
        </p>
      </motion.div>
    </div>
  );
}
