"use client";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Q = { q: string; answers: { text: string; favors: number[] }[] };
type Stage = "input" | "loading" | "grid" | "quiz" | "result";

const WORDS = ["CHOOSE", "DECIDE", "YES", "NO", "PICK", "WOULD YOU RATHER", "THIS ONE", "THAT ONE"];
const COLORS = ["#ff2e88", "#20e3ff", "#b6ff3c", "#ffb020"];

async function post(url: string, body: unknown) {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || "Something went wrong");
  return d;
}

function FloatingWords() {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {WORDS.map((w, i) => (
        <motion.span
          key={w}
          className="absolute whitespace-nowrap text-[14vw] font-bold leading-none text-white/[0.04]"
          style={{ left: `${(i * 23) % 80 - 5}%`, top: `${(i * 37) % 90}%` }}
          animate={reduce ? undefined : { y: [0, -40, 0], x: [0, i % 2 ? 30 : -30, 0] }}
          transition={{ duration: 14 + i * 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {w}
        </motion.span>
      ))}
    </div>
  );
}

export default function Page() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [stage, setStage] = useState<Stage>("input");
  const [options, setOptions] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState([0, 0, 0, 0]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [spin, setSpin] = useState<number | null>(null);
  const [winner, setWinner] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const reset = () => {
    setStage("input"); setOptions([]); setQuestions([]); setStep(0); setScores([0, 0, 0, 0]);
    setAnswers([]); setSpin(null); setWinner(null); setReason(""); setError("");
  };

  async function expand() {
    if (!a.trim()) return setError("Enter at least one option.");
    setError(""); setStage("loading");
    try {
      const d = await post("/api/expand", { inputs: [a, b] });
      setOptions(d.options); setStage("grid");
    } catch (e: any) { setError(e.message); setStage("input"); }
  }

  async function startQuiz() {
    setError(""); setStage("loading");
    try {
      const d = await post("/api/decide", { mode: "questions", options });
      setQuestions(d.questions); setStep(0); setScores([0, 0, 0, 0]); setAnswers([]); setStage("quiz");
    } catch (e: any) { setError(e.message); setStage("grid"); }
  }

  async function answer(ans: Q["answers"][number]) {
    const next = scores.map((s, i) => s + (ans.favors.includes(i) ? 1 : 0));
    const nextAnswers = [...answers, ans.text];
    setScores(next); setAnswers(nextAnswers);
    if (step + 1 < questions.length) return setStep(step + 1);
    const w = next.indexOf(Math.max(...next));
    setStage("result"); setWinner(w); setReason("");
    try {
      const d = await post("/api/decide", { mode: "verdict", options, winner: w, answers: nextAnswers });
      setReason(d.reason);
    } catch { setReason("The numbers don't lie."); }
  }

  async function letAI() {
    setError(""); setStage("result"); setWinner(null); setReason("");
    let i = 0;
    const t = setInterval(() => setSpin(i++ % 4), 110);
    try {
      const [d] = await Promise.all([post("/api/decide", { mode: "ai", options }), new Promise((r) => setTimeout(r, 2400))]);
      clearInterval(t); setSpin(null); setWinner(d.winner); setReason(d.reason);
    } catch (e: any) { clearInterval(t); setSpin(null); setError(e.message); setStage("grid"); }
  }

  const max = Math.max(...scores);
  const dimmed = (i: number) =>
    (stage === "result" && winner !== null && winner !== i) || (stage === "quiz" && step > 0 && scores[i] < max);

  return (
    <main className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-5 py-12">
      <FloatingWords />

      <h1 className="text-center text-5xl font-bold tracking-tight sm:text-7xl">
        Can’t pick? <span className="text-hot">We will.</span>
      </h1>
      <p className="mt-4 text-center text-lg text-white/60">Give us one or two options. We’ll find the rest, then settle it.</p>

      <AnimatePresence mode="wait">
        {stage === "input" && (
          <motion.div key="input" exit={{ opacity: 0, y: -20 }} className="mt-10 w-full max-w-xl space-y-3">
            {[[a, setA, "Option one (e.g. Pizza)"], [b, setB, "Option two (optional)"]].map(([v, set, ph], i) => (
              <input
                key={i}
                value={v as string}
                onChange={(e) => (set as any)(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && expand()}
                placeholder={ph as string}
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-6 py-5 text-2xl backdrop-blur-md placeholder:text-white/30 focus:border-ice focus:outline-none"
              />
            ))}
            <button onClick={expand} className="w-full rounded-2xl bg-hot px-6 py-5 text-2xl font-bold text-ink transition hover:scale-[1.02] active:scale-95">
              Find my options
            </button>
          </motion.div>
        )}

        {stage === "loading" && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-10 grid w-full grid-cols-2 gap-4" role="status" aria-label="Loading">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-36 animate-shimmer rounded-3xl border border-white/10 bg-[linear-gradient(110deg,rgba(255,255,255,0.05)_30%,rgba(255,255,255,0.18)_50%,rgba(255,255,255,0.05)_70%)] bg-[length:200%_100%]" />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {(stage === "grid" || stage === "quiz" || stage === "result") && (
        <>
          <motion.div layout className="mt-10 grid w-full grid-cols-2 gap-4">
            {options.map((o, i) => {
              const isWin = stage === "result" && winner === i;
              const isSpin = spin === i;
              return (
                <motion.div
                  key={o + i}
                  layout
                  initial={{ opacity: 0, scale: 0.8, y: 30 }}
                  animate={{ opacity: dimmed(i) ? 0.25 : 1, scale: isWin ? 1.06 : 1, y: 0 }}
                  transition={{ delay: stage === "grid" ? i * 0.08 : 0, type: "spring", stiffness: 260, damping: 20 }}
                  whileHover={{ scale: 1.05, rotate: i % 2 ? 1.5 : -1.5 }}
                  className="flex h-36 items-center justify-center rounded-3xl border bg-white/10 p-4 text-center text-2xl font-bold backdrop-blur-md sm:h-44 sm:text-4xl"
                  style={{
                    borderColor: isWin || isSpin ? COLORS[i] : "rgba(255,255,255,0.2)",
                    boxShadow: isWin || isSpin ? `0 0 50px ${COLORS[i]}88` : "none",
                    color: isWin ? COLORS[i] : "white",
                  }}
                >
                  {o}
                </motion.div>
              );
            })}
          </motion.div>

          <div className="mt-8 w-full text-center">
            <AnimatePresence mode="wait">
              {stage === "grid" && (
                <motion.div key="fork" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid gap-3 sm:grid-cols-2">
                  <button onClick={startQuiz} className="rounded-2xl border border-ice px-6 py-5 text-xl font-bold text-ice transition hover:bg-ice hover:text-ink">
                    Ask me 3 questions
                  </button>
                  <button onClick={letAI} className="rounded-2xl bg-lime px-6 py-5 text-xl font-bold text-ink transition hover:scale-[1.02] active:scale-95">
                    Let AI decide
                  </button>
                </motion.div>
              )}

              {stage === "quiz" && questions[step] && (
                <motion.div key={`q${step}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
                  <p className="mb-4 text-2xl font-bold sm:text-3xl">{questions[step].q}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {questions[step].answers.map((ans, i) => (
                      <button key={i} onClick={() => answer(ans)} className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-lg backdrop-blur-md transition hover:border-hot hover:bg-hot/20">
                        {ans.text}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {stage === "result" && (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[7rem]">
                  {winner === null ? (
                    <p className="text-2xl text-white/60">Spinning…</p>
                  ) : (
                    <>
                      <p className="text-3xl font-bold sm:text-4xl" style={{ color: COLORS[winner] }}>{options[winner]} wins.</p>
                      <p className="mx-auto mt-3 max-w-xl text-lg text-white/80">{reason || "…"}</p>
                      <button onClick={reset} className="mt-6 rounded-2xl border border-white/30 px-6 py-3 text-lg transition hover:bg-white/10">
                        Decide something else
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}

      {error && <p role="alert" className="mt-6 text-center text-hot">{error}</p>}
    </main>
  );
}
