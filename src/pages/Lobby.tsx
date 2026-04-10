import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy, Check, Users, Crown, Settings, Play, X, Puzzle,
} from "lucide-react";
import { AppLogo } from "@/components/AppLogo";
import { JoinQRCode } from "@/components/JoinQRCode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAnonymousAuth } from "@/hooks/useAnonymousAuth";
import { useGameSession } from "@/hooks/useGameSession";
import { DIFFICULTY_CONFIG } from "@/lib/gameData";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
 
function buildWordFrequency(responses: string[]) {
  const freq: Record<string, number> = {};
  responses.forEach((r) => {
    r.split(/[\s,/&]+/).forEach((w) => {
      const word = w.replace(/[^a-zA-Z]/g, "").toLowerCase();
      if (word.length < 2) return;
      freq[word] = (freq[word] || 0) + 1;
    });
  });
  return Object.entries(freq)
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 60);
}
const PALETTE = ["#f97316","#6366f1","#10b981","#f43f5e","#8b5cf6","#06b6d4","#eab308","#ec4899"];
function wordColor(word: string) {
  let h = 0;
  for (let i = 0; i < word.length; i++) h = word.charCodeAt(i) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
}
function wordSize(count: number, max: number) {
  const min = 0.8, ceil = 2.8;
  if (max <= 1) return "1.2rem";
  return `${(min + ((count - 1) / (max - 1)) * (ceil - min)).toFixed(2)}rem`;
}

const Lobby = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { userId, loading: authLoading } = useAnonymousAuth();
  const {
    session, players, currentPlayer, loading,
    startGame, updateDifficulty, kickPlayer,
  } = useGameSession(sessionId ?? null, userId);

  const [copied, setCopied] = useState(false);
  const [ideaResponses, setIdeaResponses] = useState<string[]>([]);
  const isGameMaster = currentPlayer?.is_game_master ?? false;

  useEffect(() => {
    if (session?.status === "playing") {
      navigate(`/game/${session.id}`);
    }
    if (session?.status === "finished") {
      navigate(`/results/${session.id}`);
    }
  }, [session?.status, session?.id, navigate]);

  useEffect(() => {
  if (!sessionId) return;
  const channel = supabase.channel(`idea_presence_${sessionId}`, {
    config: { presence: { key: "observer_" + Date.now() } },
  });
  channel
    .on("presence", { event: "sync" }, () => {
      const state = channel.presenceState() as Record<string, any[]>;
      const responses: string[] = [];
      Object.values(state).forEach((presences) => {
        presences.forEach((p: any) => {
          if (p.response) responses.push(p.response);
        });
      });
      setIdeaResponses(responses);
    })
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}, [sessionId]);

  const copyLink = () => {
    const url = `${window.location.origin}/?code=${session?.code}`;
    navigator.clipboard.writeText(url).catch(() => {
      // Fallback for environments without clipboard API
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    });
    setCopied(true);
    toast.success("Invite link copied!");
    setTimeout(() => setCopied(false), 2500);
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}>
          <Puzzle className="h-12 w-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4">
        <p className="text-muted-foreground">Game session not found.</p>
        <Button onClick={() => navigate("/")} className="min-h-[44px] touch-manipulation">Go Home</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-lg space-y-5"
      >
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex justify-center">
            <AppLogo size="md" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Game Lobby</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isGameMaster ? "Share the code below with your students" : "Waiting for the game to start…"}
          </p>

          {/* Game code + QR for joining */}
          <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-center sm:gap-6">
            <JoinQRCode
              key={session.code}
              value={typeof window !== "undefined" ? `${window.location.origin}/?code=${session.code}` : ""}
              label="Scan to join"
              size={140}
            />
            <div className="flex flex-col items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-2xl border-2 border-primary/20 bg-card px-4 py-2.5 shadow-sm">
                <span className="font-display text-2xl font-bold tracking-[0.25em] text-primary sm:text-3xl sm:tracking-[0.35em]">
                  {session.code}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={copyLink}
                  className="h-10 w-10 shrink-0 touch-manipulation min-h-[44px] min-w-[44px]"
                  title="Copy invite link"
                  aria-label="Copy invite link"
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.span
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Check className="h-5 w-5 text-success" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="copy"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Copy className="h-5 w-5" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Students go to the site and enter this code, or scan the QR
              </p>
            </div>
          </div>
        </div>

        {/* GM Settings */}
        {isGameMaster && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="h-4 w-4 text-primary" /> Game Settings
              </CardTitle>
              <CardDescription className="text-xs">
                Choose difficulty before starting the game.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Difficulty Level</label>
                <Select
                  value={session.difficulty}
                  onValueChange={(v) => updateDifficulty(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DIFFICULTY_CONFIG).map(([key, cfg]) => (
                      <SelectItem key={key} value={key}>
                        <span className="font-semibold">{cfg.label}</span>
                        <span className="ml-2 text-muted-foreground text-xs">— {cfg.description}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Players List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-primary" />
              Players
              <Badge variant="secondary" className="ml-auto font-mono">{players.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <AnimatePresence>
                {players.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ delay: i * 0.04 }}
                    className={`flex items-center justify-between rounded-xl border px-4 py-2.5 transition-colors ${
                      p.is_game_master
                        ? "border-secondary/30 bg-secondary/5"
                        : "border-border bg-background"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Avatar circle */}
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">
                        {p.nickname.charAt(0).toUpperCase()}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {p.is_game_master && <Crown className="h-3.5 w-3.5 text-secondary shrink-0" />}
                        <span className="font-medium text-sm">{p.nickname}</span>
                        {p.is_game_master && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Teacher</Badge>
                        )}
                        {p.user_id === userId && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">You</Badge>
                        )}
                      </div>
                    </div>
                    {isGameMaster && !p.is_game_master && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive min-w-[44px] min-h-[44px]"
                        onClick={() => kickPlayer(p.id)}
                        title={`Remove ${p.nickname}`}
                        aria-label={`Remove ${p.nickname} from game`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {players.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No players connected yet…
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Word Cloud */}
          <div className="w-full rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="mb-1 text-sm font-semibold">💡 Where we get our best ideas</p>
            <p className="mb-3 text-xs text-muted-foreground">
              {ideaResponses.length} {ideaResponses.length === 1 ? "response" : "responses"} · live
            </p>
            {ideaResponses.length === 0 ? (
              <p className="text-center text-sm italic text-muted-foreground py-4">
                Waiting for students to answer…
              </p>
            ) : (
              <div className="flex min-h-[80px] flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-xl bg-muted/40 px-4 py-4">
                {buildWordFrequency(ideaResponses).map(({ text, count }) => {
                  const max = buildWordFrequency(ideaResponses)[0]?.count ?? 1;
                  return (
                    <motion.span
                      key={text}
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      style={{
                        fontSize: wordSize(count, max),
                        color: wordColor(text),
                        fontWeight: count >= max * 0.7 ? 700 : 400,
                        lineHeight: 1.3,
                      }}
                    >
                      {text}
                    </motion.span>
                  );
                })}
              </div>
            )}
          </div>

        {/* Start / Waiting */}
        {isGameMaster ? (
          <div className="space-y-2">
            <Button
              size="lg"
              className="w-full gap-2 text-base shadow-lg shadow-primary/20 min-h-[48px] touch-manipulation"
              disabled={players.length < 1}
              onClick={startGame}
            >
              <Play className="h-5 w-5" />
              Start Game for Everyone
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              {players.length < 2
                ? "Waiting for at least 1 student to join…"
                : `${players.length} player${players.length !== 1 ? "s" : ""} ready`}
            </p>
          </div>
        ) : (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex items-center justify-center gap-3 py-6">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
              </div>
              <p className="text-sm text-muted-foreground">
                Waiting for the teacher to start the game…
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

export default Lobby;
