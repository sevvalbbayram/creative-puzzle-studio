import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Puzzle, Users, Trophy, Sparkles, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAnonymousAuth } from "@/hooks/useAnonymousAuth";
import { useGameSession } from "@/hooks/useGameSession";
import elephantImg from "@/assets/elephant-puzzle.png";

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
    if (sess) navigate(`/lobby/${sess.id}`);
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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      {/* Theme toggle */}
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>
      {/* Background elephant image */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.06]">
        <img src={elephantImg} alt="" className="h-full w-full object-cover" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex w-full max-w-md flex-col items-center gap-8"
      >
        {/* Logo / Title */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-lg"
          >
            <Puzzle className="h-10 w-10 text-primary-foreground" />
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Creativity is...
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            A jigsaw puzzle game about the creative process
          </p>
        </div>

        {/* Home Mode */}
        {mode === "home" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex w-full flex-col gap-3"
          >
            <Button size="lg" className="w-full gap-2 text-lg" onClick={() => setMode("create")}>
              <Sparkles className="h-5 w-5" />
              Create Game
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full gap-2 text-lg"
              onClick={() => setMode("join")}
            >
              <Users className="h-5 w-5" />
              Join Game
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="w-full gap-2 text-lg"
              onClick={() => navigate("/leaderboard")}
            >
              <Trophy className="h-5 w-5" />
              Leaderboard
            </Button>
          </motion.div>
        )}

        {/* Create Mode */}
        {mode === "create" && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Create a New Game</CardTitle>
              <CardDescription>You'll be the Game Master with full control.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="nickname" className="mb-1 block text-sm font-medium">
                  Your Nickname
                </label>
                <Input
                  id="nickname"
                  placeholder="Enter your nickname..."
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={20}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => { setMode("home"); setError(null); }}>
                  Back
                </Button>
                <Button
                  className="flex-1 gap-2"
                  disabled={!nickname.trim() || submitting}
                  onClick={handleCreate}
                >
                  {submitting ? "Creating..." : "Create Game"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Join Mode */}
        {mode === "join" && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Join a Game</CardTitle>
              <CardDescription>Enter the game code shared by the Game Master.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="join-nickname" className="mb-1 block text-sm font-medium">
                  Your Nickname
                </label>
                <Input
                  id="join-nickname"
                  placeholder="Enter your nickname..."
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={20}
                />
              </div>
              <div>
                <label htmlFor="game-code" className="mb-1 block text-sm font-medium">
                  Game Code
                </label>
                <Input
                  id="game-code"
                  placeholder="e.g. ABC123"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="text-center text-xl font-display tracking-[0.3em]"
                  onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => { setMode("home"); setError(null); }}>
                  Back
                </Button>
                <Button
                  className="flex-1 gap-2"
                  disabled={!nickname.trim() || !gameCode.trim() || submitting}
                  onClick={handleJoin}
                >
                  {submitting ? "Joining..." : "Join Game"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features strip */}
        <div className="grid grid-cols-3 gap-4 text-center text-xs text-muted-foreground">
          <div className="flex flex-col items-center gap-1">
            <Puzzle className="h-5 w-5 text-primary" />
            <span>Drag & Drop</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Users className="h-5 w-5 text-secondary" />
            <span>Multiplayer</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Trophy className="h-5 w-5 text-accent" />
            <span>Leaderboard</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
