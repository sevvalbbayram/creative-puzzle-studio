import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Clock, Target, CheckCircle2, Loader2, Users,
  StopCircle, ArrowLeft, Puzzle, BarChart3, Download, Send,
  Pause, Play, Eye, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useAnonymousAuth } from "@/hooks/useAnonymousAuth";
import { useGameSession } from "@/hooks/useGameSession";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import puzzleBgImg from "@/assets/puzzle-background.png";
import { CREATIVITY_STAGES } from "@/lib/gameData";

const slotPositions: Record<string, { top: string; left: string; width: string }> = {
  preparation:  { top: "56%", left: "4%",  width: "15%" },
  incubation:   { top: "38%", left: "21%", width: "15%" },
  illumination: { top: "22%", left: "38%", width: "15%" },
  evaluation:   { top: "14%", left: "56%", width: "15%" },
  elaboration:  { top: "28%", left: "74%", width: "15%" },
};

const quotePositions: Record<string, { top: string; left: string; width: string }> = {
  preparation:  { top: "74%", left: "2%",  width: "21%" },
  incubation:   { top: "57%", left: "19%", width: "21%" },
  illumination: { top: "42%", left: "36%", width: "21%" },
  evaluation:   { top: "34%", left: "54%", width: "21%" },
  elaboration:  { top: "48%", left: "72%", width: "21%" },
};

const jigsawClip = "polygon(8% 0%, 36% 0%, 38% 5%, 50% 8%, 62% 5%, 64% 0%, 92% 0%, 100% 8%, 100% 36%, 105% 38%, 108% 50%, 105% 62%, 100% 64%, 100% 92%, 92% 100%, 64% 100%, 62% 95%, 50% 92%, 38% 95%, 36% 100%, 8% 100%, 0% 92%, 0% 64%, -5% 62%, -8% 50%, -5% 38%, 0% 36%, 0% 8%)";

const stageColors: Record<string, string> = {
  preparation:  "bg-stage-preparation/40",
  incubation:   "bg-stage-incubation/40",
  illumination: "bg-stage-illumination/40",
  evaluation:   "bg-stage-evaluation/40",
  elaboration:  "bg-stage-elaboration/40",
};

const TeacherDashboard = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { userId } = useAnonymousAuth();
  const { session, players, currentPlayer, endGame, togglePause } = useGameSession(sessionId ?? null, userId);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [showPuzzlePreview, setShowPuzzlePreview] = useState(false);

  const isGameMaster = currentPlayer?.is_game_master ?? false;
  const isPaused = !!session?.paused_at;

  useEffect(() => {
    if (session?.status === "finished") {
      navigate(`/results/${session.id}`);
    }
  }, [session?.status, session?.id, navigate]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, "0")}`;
  };

  const sorted = [...players].sort((a, b) => {
    if (a.completed && !b.completed) return -1;
    if (!a.completed && b.completed) return 1;
    return b.score - a.score;
  });

  const completedCount = sorted.filter((p) => p.completed).length;
  const avgScore = sorted.length > 0
    ? Math.round(sorted.reduce((sum, p) => sum + p.score, 0) / sorted.length)
    : 0;
  const bestTime = sorted
    .filter((p) => p.completed && p.elapsed_time_ms > 0)
    .reduce((best, p) => Math.min(best, p.elapsed_time_ms), Infinity);

  const exportCSV = () => {
    const headers = ["Rank", "Nickname", "Score", "Time", "Misses", "Completed"];
    const rows = sorted.map((p, i) => [
      i + 1,
      `"${p.nickname}"`,
      p.score,
      formatTime(p.elapsed_time_ms),
      p.incorrect_attempts,
      p.completed ? "Yes" : "No",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `game-results-${session?.code ?? "export"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded!");
  };

  const sendBroadcast = async () => {
    if (!broadcastMsg.trim() || !sessionId || !userId) return;
    setSending(true);
    const { error } = await supabase.from("broadcast_messages").insert({
      session_id: sessionId,
      sender_id: userId,
      message: broadcastMsg.trim(),
    });
    setSending(false);
    if (error) {
      toast.error("Failed to send message");
    } else {
      toast.success("Message sent to all students!");
      setBroadcastMsg("");
    }
  };

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}>
          <Puzzle className="h-12 w-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-card/80 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-display text-lg font-bold">Teacher Dashboard</h1>
          <span className="rounded-full bg-muted px-3 py-0.5 text-xs font-medium text-muted-foreground">
            {session.code}
          </span>
          {isPaused && (
            <span className="rounded-full bg-destructive/10 px-3 py-0.5 text-xs font-bold text-destructive animate-pulse">
              ⏸ PAUSED
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full bg-muted px-3 py-0.5 text-xs font-medium text-muted-foreground">
            <Users className="h-3 w-3" /> {players.length} connected
          </span>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <SummaryCard icon={<Users className="h-5 w-5 text-primary" />} label="Players" value={String(players.length)} />
            <SummaryCard icon={<CheckCircle2 className="h-5 w-5 text-success" />} label="Finished" value={`${completedCount}/${players.length}`} />
            <SummaryCard icon={<BarChart3 className="h-5 w-5 text-secondary" />} label="Avg Score" value={String(avgScore)} />
            <SummaryCard icon={<Clock className="h-5 w-5 text-accent-foreground" />} label="Best Time" value={bestTime === Infinity ? "—" : formatTime(bestTime)} />
          </div>

          {/* Timer Control + Watch Live */}
          {isGameMaster && (
            <div className="flex flex-wrap gap-3">
              <Button
                variant={isPaused ? "default" : "outline"}
                size="lg"
                className="flex-1 gap-2 min-w-[180px]"
                onClick={togglePause}
              >
                {isPaused ? (
                  <>
                    <Play className="h-5 w-5" /> Resume Game
                  </>
                ) : (
                  <>
                    <Pause className="h-5 w-5" /> Pause Game
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 gap-2 min-w-[180px]"
                onClick={() => setShowPuzzlePreview(true)}
              >
                <Eye className="h-5 w-5" /> Watch Live
              </Button>
            </div>
          )}

          {/* Broadcast Message */}
          {isGameMaster && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Send className="h-4 w-4" /> Broadcast to Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendBroadcast();
                  }}
                >
                  <Input
                    placeholder="Type a message for all students..."
                    value={broadcastMsg}
                    onChange={(e) => setBroadcastMsg(e.target.value)}
                    maxLength={200}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!broadcastMsg.trim() || sending} className="gap-1">
                    <Send className="h-4 w-4" />
                    Send
                  </Button>
                </form>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {["👏 Great job!", "⏰ Hurry up!", "⏳ 2 minutes left!", "🤔 Read carefully!", "💪 Almost there!"].map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      disabled={sending}
                      onClick={() => setBroadcastMsg(preset)}
                      onDoubleClick={() => {
                        setBroadcastMsg(preset);
                        supabase.from("broadcast_messages").insert({
                          session_id: sessionId!,
                          sender_id: userId!,
                          message: preset,
                        }).then(({ error }) => {
                          if (!error) toast.success("Sent: " + preset);
                        });
                      }}
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Tap to fill, double-tap to send instantly
                </p>
              </CardContent>
            </Card>
          )}

          {/* Class Progress */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span>Class Progress</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {completedCount}/{players.length} complete
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress
                value={players.length > 0 ? (completedCount / players.length) * 100 : 0}
                className="h-3"
              />
            </CardContent>
          </Card>

          {/* Student List */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span>Student Progress</span>
                <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={exportCSV}>
                  <Download className="h-3 w-3" /> Export CSV
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sorted.map((player, i) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                      player.completed
                        ? "border-success/30 bg-success/5"
                        : "border-border bg-background"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      <div>
                        <span className="font-display text-sm font-semibold">{player.nickname}</span>
                        {player.is_game_master && (
                          <span className="ml-2 rounded bg-secondary/20 px-1.5 py-0.5 text-[10px] font-medium text-secondary">GM</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Trophy className="h-3 w-3" />{player.score}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(player.elapsed_time_ms)}</span>
                        <span className="flex items-center gap-1"><Target className="h-3 w-3" />{player.incorrect_attempts}</span>
                      </div>
                      {player.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </div>
                ))}
                {sorted.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">No players connected yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* End Game */}
          {isGameMaster && (
            <Button variant="destructive" size="lg" className="w-full gap-2" onClick={endGame}>
              <StopCircle className="h-5 w-5" /> End Game for All Students
            </Button>
          )}
        </div>
      </main>

      {/* Watch Live Puzzle Preview Modal */}
      <AnimatePresence>
        {showPuzzlePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowPuzzlePreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-3xl rounded-2xl bg-card p-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-lg font-bold flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" /> Puzzle Preview
                </h2>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowPuzzlePreview(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                This is what students see — slot positions on the puzzle board.
              </p>
              <div className="relative mx-auto aspect-[4/3] w-full overflow-hidden rounded-xl border-2 border-primary/20">
                <img
                  src={puzzleBgImg}
                  alt="Puzzle preview"
                  className="h-full w-full object-cover rounded-xl"
                  draggable={false}
                />
                <div className="absolute inset-0">
                  {CREATIVITY_STAGES.map((stage, i) => {
                    const pos = slotPositions[stage.id];
                    const qPos = quotePositions[stage.id];
                    const color = stageColors[stage.id] || "bg-primary/40";
                    return (
                      <div key={stage.id}>
                        {/* Stage slot preview */}
                        <div
                          style={{
                            position: "absolute",
                            top: pos.top,
                            left: pos.left,
                            width: pos.width,
                            clipPath: jigsawClip,
                          }}
                          className={`flex h-8 items-center justify-center text-[7px] font-bold text-white/90 sm:h-10 sm:text-[9px] md:h-11 md:text-xs ${color} backdrop-blur-[2px]`}
                        >
                          {stage.name}
                        </div>
                        {/* Quote slot preview */}
                        <div
                          style={{
                            position: "absolute",
                            top: qPos.top,
                            left: qPos.left,
                            width: qPos.width,
                            clipPath: jigsawClip,
                          }}
                          className={`flex min-h-[1.8rem] items-center justify-center p-1 text-[5px] leading-tight text-white/80 sm:min-h-[2.4rem] sm:text-[7px] md:min-h-[2.8rem] md:text-[9px] ${color} backdrop-blur-[2px]`}
                        >
                          {stage.quote.slice(0, 30)}...
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        {icon}
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-display text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default TeacherDashboard;
