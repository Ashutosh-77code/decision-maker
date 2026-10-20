import { NextResponse } from "next/server";
import { askJSON } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { mode, options, winner, answers } = await req.json();
    const list = JSON.stringify(options);

    if (mode === "questions") {
      const out = await askJSON<{ questions: any[] }>(
        "You write short, playful personality-style questions that help someone choose between options.",
        `Options (index 0-3): ${list}\nWrite 3 questions, each with 2 answers. Each answer has "text" and "favors": the option indexes it points toward. Return {"questions":[{"q":"...","answers":[{"text":"...","favors":[0,2]},{"text":"...","favors":[1,3]}]}]}.`
      );
      return NextResponse.json(out);
    }

    if (mode === "verdict") {
      const out = await askJSON<{ reason: string }>(
        "You are a witty decision oracle. One sentence, funny or logical.",
        `Options: ${list}\nChosen: ${options[winner]}\nThe user's answers: ${JSON.stringify(answers ?? [])}\nReturn {"reason":"..."} explaining why this wins.`
      );
      return NextResponse.json(out);
    }

    // mode === "ai": random winner picked server-side, AI writes the justification
    const pick = Math.floor(Math.random() * options.length);
    const out = await askJSON<{ reason: string }>(
      "You are a witty decision oracle. One sentence, funny or logical.",
      `Options: ${list}\nChosen: ${options[pick]}\nReturn {"reason":"..."} justifying the choice.`
    );
    return NextResponse.json({ winner: pick, reason: out.reason });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Something went wrong" }, { status: 500 });
  }
}
