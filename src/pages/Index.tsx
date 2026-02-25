import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Puzzle, Users, Trophy, Sparkles, ArrowRight, BookOpen } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAnonymousAuth } from "@/hooks/useAnonymousAuth";
import { useGameSession } from "@/hooks/useGameSession";
import elephantImg from "@/assets/elephant-puzzle.png";

const STAGES = [
  { name: "Preparation", color: "bg-stage-preparation", emoji: "🔵" },
  { name: "Incubation",  color: "bg-stage-incubation",  emoji: "🟣" },
  { name: "Illumination",color: "bg-stage-illumination",emoji: "🟡" },
  { name: "Evaluation",  color: "bg-stage-evaluation",  emoji: "🔴" },
  { name: "Elaboration", color: "bg-stage-elaboration",  emoji: "🟢" },
];

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const joinCode = searchParams.get("code");

  const { userId, loading: authLoading } = useAnonymousAuth();
  const { createSession, joinSession, error, setError } = useGameSession(null, userId);

  const [nickname, setNickname] = useState("");
  const [gameCode, setGameCode] = useState(joinCode || "");
  const [mode, setMode] = useState<"home" | "create" | "join">(joinCode ? "join" : "home");
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!nickname.trim()) return;
    setSubmitting(true);
    setError(null);
    const sess = await createSession(nickname.trim());
    setSubmitting(false);
    if (sess) navigate(`/lobby/${sess.id}`);
  };

  const handleJoin = async () => {
    if (!nickname.trim() || !gameCode.trim()) return;
    setSubmitting(true);
    setError(null);
    const sess = await joinSession(gameCode.trim(), nickname.trim());
    setSubmitting(false);
    if (!sess) return;
    // Late joiners (game already started) go directly to the game page
    if (sess.status === "playing") {
      navigate(`/game/${sess.id}`);
    } else {
      navigate(`/lobby/${sess.id}`);
    }
  };

  if (authLoading) {
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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-8">
      {/* Controls */}
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      {/* Elephant background — visible but not overpowering */}
      <div className="pointer-events-none absolute inset-0">
        <img
          src={elephantImg}
          alt=""
          className="h-full w-full object-cover opacity-[0.13] dark:opacity-[0.08]"
        />
        {/* Gradient vignette so the center card stays readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background/70" />
      </div>

      {/* Floating stage badges behind the card */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {STAGES.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.18, y: 0 }}
            transition={{ delay: 0.6 + i * 0.15, duration: 0.6 }}
            style={{
              position: "absolute",
              top: `${15 + i * 15}%`,
              left: i % 2 === 0 ? `${4 + i * 2}%` : undefined,
              right: i % 2 !== 0 ? `${4 + i * 2}%` : undefined,
            }}
            className={`rounded-full ${s.color} px-3 py-1 text-xs font-bold text-white shadow-lg`}
          >
            {s.emoji} {s.name}
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative z-10 flex w-full max-w-md flex-col items-center gap-6"
      >
        {/* Logo */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 220, delay: 0.18 }}
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-primary/70 shadow-xl shadow-primary/30"
          >
            <Puzzle className="h-10 w-10 text-primary-foreground" />
          </motion.div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Creativity is<span className="text-primary">…</span>
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            A jigsaw puzzle game about the creative process
          </p>

          {/* Stage preview pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="mt-3 flex flex-wrap justify-center gap-1.5"
          >
            {STAGES.map((s) => (
              <span
                key={s.name}
                className={`rounded-full ${s.color} px-2.5 py-0.5 text-[10px] font-semibold text-white opacity-90 shadow-sm`}
              >
                {s.name}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Mode panels */}
        <AnimatePresence mode="wait">
          {mode === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="flex w-full flex-col gap-3"
            >
              <Button
                size="lg"
                className="w-full gap-2 text-base shadow-lg shadow-primary/20"
                onClick={() => setMode("create")}
              >
                <Sparkles className="h-5 w-5" />
                Create Game
                <span className="ml-auto text-xs opacity-70 font-normal">Teacher</span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full gap-2 text-base"
                onClick={() => setMode("join")}
              >
                <Users className="h-5 w-5" />
                Join Game
                <span className="ml-auto text-xs opacity-70 font-normal">Student</span>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="w-full gap-2 text-base"
                onClick={() => navigate("/leaderboard")}
              >
                <Trophy className="h-5 w-5" />
                Leaderboard
              </Button>
            </motion.div>
          )}

          {mode === "create" && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="w-full"
            >
              <Card className="shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Create a New Game
                  </CardTitle>
                  <CardDescription>
                    You'll be the Game Master with full control over the session.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="nickname" className="mb-1.5 block text-sm font-medium">
                      Your Name / Nickname
                    </label>
                    <Input
                      id="nickname"
                      placeholder="e.g. Ms. Rivera"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      maxLength={20}
                      onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                      autoFocus
                    />
                  </div>
                  {error && (
                    <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {error}
                    </p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <Button variant="ghost" onClick={() => { setMode("home"); setError(null); }}>
                      Back
                    </Button>
                    <Button
                      className="flex-1 gap-2"
                      disabled={!nickname.trim() || submitting}
                      onClick={handleCreate}
                    >
                      {submitting ? "Creating…" : "Create Game"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {mode === "join" && (
            <motion.div
              key="join"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="w-full"
            >
              <Card className="shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Join a Game
                  </CardTitle>
                  <CardDescription>
                    Enter the 6-character code shared by your teacher.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="join-nickname" className="mb-1.5 block text-sm font-medium">
                      Your Nickname
                    </label>
                    <Input
                      id="join-nickname"
                      placeholder="Enter your nickname…"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      maxLength={20}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label htmlFor="game-code" className="mb-1.5 block text-sm font-medium">
                      Game Code
                    </label>
                    <Input
                      id="game-code"
                      placeholder="e.g. ABC123"
                      value={gameCode}
                      onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                      maxLength={6}
                      className="text-center font-display text-xl tracking-[0.35em]"
                      onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                    />
                  </div>
                  {error && (
                    <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {error}
                    </p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <Button variant="ghost" onClick={() => { setMode("home"); setError(null); }}>
                      Back
                    </Button>
                    <Button
                      className="flex-1 gap-2"
                      disabled={!nickname.trim() || !gameCode.trim() || submitting}
                      onClick={handleJoin}
                    >
                      {submitting ? "Joining…" : "Join Game"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feature strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="grid w-full grid-cols-4 gap-3 text-center text-xs text-muted-foreground"
        >
          {[
            { icon: <Puzzle className="h-5 w-5 text-primary mx-auto" />,   label: "Drag & Drop" },
            { icon: <Users   className="h-5 w-5 text-secondary mx-auto" />, label: "Multiplayer" },
            { icon: <Trophy  className="h-5 w-5 text-accent mx-auto" />,   label: "Leaderboard" },
            { icon: <BookOpen className="h-5 w-5 text-stage-elaboration mx-auto" />, label: "5 Stages" },
          ].map((f) => (
            <div key={f.label} className="flex flex-col items-center gap-1">
              {f.icon}
              <span>{f.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
