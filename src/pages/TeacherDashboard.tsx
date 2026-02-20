import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy, Clock, Target, CheckCircle2, Loader2, Users,
  StopCircle, ArrowLeft, Puzzle, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAnonymousAuth } from "@/hooks/useAnonymousAuth";
import { useGameSession } from "@/hooks/useGameSession";
import { ThemeToggle } from "@/components/ThemeToggle";

const TeacherDashboard = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { userId } = useAnonymousAuth();
  const { session, players, currentPlayer, endGame } = useGameSession(sessionId ?? null, userId);

  const isGameMaster = currentPlayer?.is_game_master ?? false;

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
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/game/${sessionId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-display text-lg font-bold">Teacher Dashboard</h1>
          <span className="rounded-full bg-muted px-3 py-0.5 text-xs font-medium text-muted-foreground">
            {session.code}
          </span>
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
            <SummaryCard
              icon={<Users className="h-5 w-5 text-primary" />}
              label="Players"
              value={String(players.length)}
            />
            <SummaryCard
              icon={<CheckCircle2 className="h-5 w-5 text-success" />}
              label="Finished"
              value={`${completedCount}/${players.length}`}
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
              <CardTitle className="text-base">Student Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sorted.map((player, i) => (
                  <motion.div
                    key={player.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
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
                        <span className="font-display text-sm font-semibold">
                          {player.nickname}
                        </span>
                        {player.is_game_master && (
                          <span className="ml-2 rounded bg-secondary/20 px-1.5 py-0.5 text-[10px] font-medium text-secondary">
                            GM
                          </span>
                        )}
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
                  </motion.div>
                ))}

                {sorted.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No players connected yet
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
              <StopCircle className="h-5 w-5" />
              End Game for All Students
            </Button>
          )}
        </div>
      </main>
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
