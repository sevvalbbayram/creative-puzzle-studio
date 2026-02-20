import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Copy, Check, Users, Crown, Settings, Play, X, Puzzle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAnonymousAuth } from "@/hooks/useAnonymousAuth";
import { useGameSession } from "@/hooks/useGameSession";
import { DIFFICULTY_CONFIG } from "@/lib/gameData";
import { toast } from "sonner";

const Lobby = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { userId, loading: authLoading } = useAnonymousAuth();
  const {
    session, players, currentPlayer, loading,
    startGame, updateDifficulty, kickPlayer,
  } = useGameSession(sessionId ?? null, userId);

  const [copied, setCopied] = useState(false);
  const isGameMaster = currentPlayer?.is_game_master ?? false;

  // Redirect to game when status changes to playing
  useEffect(() => {
    if (session?.status === "playing") {
      navigate(`/game/${session.id}`);
    }
    if (session?.status === "finished") {
      navigate(`/results/${session.id}`);
    }
  }, [session?.status, session?.id, navigate]);

  const copyLink = () => {
    const url = `${window.location.origin}/?code=${session?.code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
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
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <p className="text-muted-foreground">Game not found.</p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">Game Lobby</h1>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="font-display text-2xl tracking-[0.3em] text-primary">
              {session.code}
            </span>
            <Button size="icon" variant="ghost" onClick={copyLink} className="h-8 w-8">
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Share this code or link to invite players
          </p>
        </div>

        {/* GM Settings */}
        {isGameMaster && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="h-4 w-4" /> Game Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Difficulty</label>
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
                        {cfg.label} — {cfg.description}
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
              <Users className="h-4 w-4" /> Players ({players.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {players.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-2">
                    {p.is_game_master && <Crown className="h-4 w-4 text-secondary" />}
                    <span className="font-medium">{p.nickname}</span>
                    {p.is_game_master && (
                      <Badge variant="secondary" className="text-xs">Game Master</Badge>
                    )}
                    {p.user_id === userId && (
                      <Badge variant="outline" className="text-xs">You</Badge>
                    )}
                  </div>
                  {isGameMaster && !p.is_game_master && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive"
                      onClick={() => kickPlayer(p.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Start Button (GM only) */}
        {isGameMaster ? (
          <Button
            size="lg"
            className="w-full gap-2 text-lg"
            disabled={players.length < 1}
            onClick={startGame}
          >
            <Play className="h-5 w-5" />
            Start Game
          </Button>
        ) : (
          <div className="text-center text-muted-foreground">
            <p>Waiting for the Game Master to start...</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Lobby;
