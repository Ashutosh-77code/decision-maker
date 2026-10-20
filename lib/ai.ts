// Web search: uses Tavily if TAVILY_API_KEY is set, otherwise returns mock context.
export async function search(query: string): Promise<string> {
  const key = process.env.TAVILY_API_KEY;
  if (!key) {
    return `Mock context for "${query}": widely popular, often compared with similar alternatives, loved for different moods and occasions.`;
  }
  try {
    const r = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ query, max_results: 3, include_answer: true }),
    });
    const d = await r.json();
    return [d.answer, ...(d.results ?? []).map((x: any) => x.content)]
      .filter(Boolean)
      .join("\n")
      .slice(0, 2000);
  } catch {
    return "";
  }
}

// Calls Gemini (free tier via Google AI Studio) and parses a JSON-only reply.
export async function askJSON<T>(system: string, user: string): Promise<T> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Missing GEMINI_API_KEY in .env.local");
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: `${system} Reply with JSON only.` }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: { responseMimeType: "application/json", maxOutputTokens: 900 },
    }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d?.error?.message || "The AI request failed");
  const text: string = d.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}