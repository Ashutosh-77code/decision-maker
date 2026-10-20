import { NextResponse } from "next/server";
import { askJSON, search } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { inputs } = (await req.json()) as { inputs: string[] };
    const given = (inputs ?? []).map((s) => s.trim()).filter(Boolean).slice(0, 2);
    if (!given.length) return NextResponse.json({ error: "Enter at least one option." }, { status: 400 });

    const context = (await Promise.all(given.map((g) => search(`${g} alternatives similar options`)))).join("\n---\n");
    const need = 4 - given.length;

    const out = await askJSON<{ options: string[] }>(
      "You expand a user's choices into a fun, varied set of options. Keep each option under 4 words.",
      `User options: ${JSON.stringify(given)}\nWeb context:\n${context}\n\nSuggest exactly ${need} more related but distinct options. Return {"options": [...]}.`
    );

    const options = [...given, ...(out.options ?? [])].slice(0, 4);
    if (options.length < 4) throw new Error("Could not build four options. Try again.");
    return NextResponse.json({ options });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Something went wrong" }, { status: 500 });
  }
}
