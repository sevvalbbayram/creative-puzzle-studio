import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy, Clock, Target, CheckCircle2, Loader2, Users,
  StopCircle, ArrowLeft, Puzzle, BarChart3, Download, Send,
  Pause, Play, UserPlus,
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

const TeacherDashboard = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { userId } = useAnonymousAuth();
  const { session, players, currentPlayer, endGame, togglePause } = useGameSession(sessionId ?? null, userId);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [sending, setSending] = useState(false);

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

  // A player is "late" if they joined after the game started
  const isLateJoiner = (playerCreatedAt: string) => {
    if (!session?.started_at) return false;
    return new Date(playerCreatedAt) > new Date(session.started_at);
  };

  const students = players.filter((p) => !p.is_game_master);
  const sorted = [...students].sort((a, b) => {
    if (a.completed && !b.completed) return -1;
    if (!a.completed && b.completed) return 1;
    return b.score - a.score;
  });

  const completedCount = sorted.filter((p) => p.completed).length;
  const lateCount = sorted.filter((p) => isLateJoiner(p.created_at)).length;
  const avgScore =
    sorted.length > 0
      ? Math.round(sorted.reduce((sum, p) => sum + p.score, 0) / sorted.length)
      : 0;
  const bestTime = sorted
    .filter((p) => p.completed && p.elapsed_time_ms > 0)
    .reduce((best, p) => Math.min(best, p.elapsed_time_ms), Infinity);

  const exportCSV = () => {
    const headers = ["Rank", "Nickname", "Score", "Time", "Misses", "Completed", "Late Join"];
    const rows = sorted.map((p, i) => [
      i + 1,
      `"${p.nickname}"`,
      p.score,
      formatTime(p.elapsed_time_ms),
      p.incorrect_attempts,
      p.completed ? "Yes" : "No",
      isLateJoiner(p.created_at) ? "Yes" : "No",
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
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-card/80 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate("/")}
          >
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
            <Users className="h-3 w-3" /> {students.length} students
          </span>
          {lateCount > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              <UserPlus className="h-3 w-3" /> {lateCount} late
            </span>
          )}
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <SummaryCard
              icon={<Users className="h-5 w-5 text-primary" />}
              label="Students"
              value={String(students.length)}
            />
            <SummaryCard
              icon={<CheckCircle2 className="h-5 w-5 text-success" />}
              label="Finished"
              value={`${completedCount}/${students.length}`}
            />
            <SummaryCard
              icon={<BarChart3 className="h-5 w-5 text-secondary" />}
              label="Avg Score"
              value={String(avgScore)}
            />
            <SummaryCard
              icon={<Clock className="h-5 w-5 text-accent-foreground" />}
              label="Best Time"
              value={bestTime === Infinity ? "—" : formatTime(bestTime)}
            />
          </div>

          {/* Game Controls */}
          {isGameMaster && (
            <Button
              variant={isPaused ? "default" : "outline"}
              size="lg"
              className="w-full gap-2"
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
                  <Button
                    type="submit"
                    disabled={!broadcastMsg.trim() || sending}
                    className="gap-1"
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </Button>
                </form>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[
                    "👏 Great job!",
                    "⏰ Hurry up!",
                    "⏳ 2 minutes left!",
                    "🤔 Read carefully!",
                    "💪 Almost there!",
                  ].map((preset) => (
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
                        supabase
                          .from("broadcast_messages")
                          .insert({
                            session_id: sessionId!,
                            sender_id: userId!,
                            message: preset,
                          })
                          .then(({ error }) => {
                            if (!error) toast.success("Sent: " + preset);
                          });
                      }}
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Tap to fill · Double-tap to send instantly
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
                  {completedCount}/{students.length} complete
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress
                value={students.length > 0 ? (completedCount / students.length) * 100 : 0}
                className="h-3"
              />
            </CardContent>
          </Card>

          {/* Student List */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span>Student Progress</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs"
                  onClick={exportCSV}
                >
                  <Download className="h-3 w-3" /> Export CSV
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sorted.map((player, i) => {
                  const late = isLateJoiner(player.created_at);
                  return (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                        player.completed
                          ? "border-success/30 bg-success/5"
                          : "border-border bg-background"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {i + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-display text-sm font-semibold">
                              {player.nickname}
                            </span>
                            {late && (
                              <span
                                title="Joined after game started"
                                className="inline-flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              >
                                <UserPlus className="h-2.5 w-2.5" /> Late
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            {player.score}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(player.elapsed_time_ms)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {player.incorrect_attempts}
                          </span>
                        </div>
                        {player.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : (
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  );
                })}
                {sorted.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No students connected yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* End Game */}
          {isGameMaster && (
            <Button
              variant="destructive"
              size="lg"
              className="w-full gap-2"
              onClick={endGame}
            >
              <StopCircle className="h-5 w-5" /> End Game for All Students
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
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
