import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

// ─── Word cloud helpers ───────────────────────────────────────────────────────

interface WordEntry { text: string; count: number }

function buildWordFrequency(responses: string[]): WordEntry[] {
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

function fontSize(count: number, max: number): string {
  const min = 0.85, ceiling = 3.2;
  if (max <= 1) return "1.4rem";
  return `${(min + ((count - 1) / (max - 1)) * (ceiling - min)).toFixed(2)}rem`;
}

const PALETTE = ["#f97316","#6366f1","#10b981","#f43f5e","#8b5cf6","#06b6d4","#eab308","#ec4899"];
function wordColor(word: string): string {
  let h = 0;
  for (let i = 0; i < word.length; i++) h = word.charCodeAt(i) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
}

// ─── Component ────────────────────────────────────────────────────────────────

const IdeaQuestion = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // destination is passed as ?next=lobby or ?next=game (set by Index.tsx)
  const next = searchParams.get("next") ?? "lobby";
  const nickname = searchParams.get("nickname") ?? "Player";

  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [allResponses, setAllResponses] = useState<string[]>([]);

  // ── Load existing responses + subscribe to realtime ───────────────────────
  useEffect(() => {
    if (!sessionId) return;

    // Initial fetch
    (supabase as any)
  .from("idea_responses")
  .select("response")
  .eq("session_id", sessionId)
  .then(({ data }: { data: { response: string }[] | null }) => {
    if (data) setAllResponses(data.map((r) => r.response));
  });

    // Live updates
    const channel = supabase
      .channel(`idea_${sessionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "idea_responses", filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const row = payload.new as { response: string };
          setAllResponses((prev) => [...prev, row.response]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  // ── Submit answer ─────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const trimmed = answer.trim();
    if (!trimmed) return;
    setSaving(true);
    setSaveError(null);

    const { error } = await (supabase as any).from("idea_responses").insert({
  player_name: nickname,
  session_id: sessionId ?? null,
  response: trimmed,
});

    setSaving(false);
    if (error) {
      setSaveError(error.message);
      return;
    }
    setSubmitted(true);
  };

  // ── Go to next screen ─────────────────────────────────────────────────────
  const handleContinue = () => {
    const ideaParam = `&idea=${encodeURIComponent(answer)}`;
    if (next === "game") {
      navigate(`/game/${sessionId}?idea=${encodeURIComponent(answer)}`);
    } else {
      navigate(`/lobby/${sessionId}?idea=${encodeURIComponent(answer)}`);
    }
  };

  // ── Word cloud ────────────────────────────────────────────────────────────
  const words = buildWordFrequency(allResponses);
  const maxCount = words[0]?.count ?? 1;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 flex w-full max-w-lg flex-col items-center gap-6"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 220, delay: 0.1 }}
            className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10"
          >
            <Lightbulb className="h-7 w-7 text-primary" />
          </motion.div>
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Hey {nickname}! 👋
          </h1>
          <p className="mt-2 text-lg font-medium text-foreground/80">
            Where do you get your <span className="text-primary font-bold">best ideas</span> from?
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your answer will appear in the word cloud — and become part of the puzzle!
          </p>
        </div>

        {/* Input / confirmation card */}
        <Card className="w-full shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Your answer</CardTitle>
            <CardDescription>
              Could be a place, a moment, a feeling… anything goes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!submitted ? (
              <>
                <Input
                  placeholder="e.g. the shower, long walks…"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  maxLength={80}
                  autoFocus
                  className="min-h-[44px] text-base"
                />
                {saveError && (
                  <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {saveError}
                  </p>
                )}
                <Button
                  className="w-full gap-2 min-h-[44px]"
                  disabled={saving || !answer.trim()}
                  onClick={handleSubmit}
                >
                  {saving ? "Saving…" : "Submit my answer ✨"}
                </Button>
              </>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3 text-center">
                  <p className="text-sm text-muted-foreground">Your answer</p>
                  <p className="font-display text-lg font-bold text-primary">"{answer}"</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ✅ Added to the word cloud!
                  </p>
                </div>
                <Button
                  className="w-full gap-2 min-h-[44px] text-base"
                  onClick={handleContinue}
                >
                  Continue to {next === "game" ? "the Game" : "the Lobby"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Word cloud */}
        <div className="w-full">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Ideas from this session
          </p>
          {words.length === 0 ? (
            <p className="text-center text-sm italic text-muted-foreground">
              Waiting for the first answers…
            </p>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex min-h-[120px] flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-2xl border border-border bg-card/60 px-6 py-5 shadow-inner"
            >
              {words.map(({ text, count }) => (
                <motion.span
                  key={text}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  style={{
                    fontSize: fontSize(count, maxCount),
                    color: wordColor(text),
                    fontWeight: count >= maxCount * 0.7 ? 700 : count >= maxCount * 0.4 ? 600 : 400,
                    lineHeight: 1.25,
                  }}
                >
                  {text}
                </motion.span>
              ))}
            </motion.div>
          )}
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {allResponses.length} {allResponses.length === 1 ? "response" : "responses"} · updates live
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default IdeaQuestion;6