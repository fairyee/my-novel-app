export async function POST(req) {
  const { prompt, tokens } = await req.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ text: "API 키가 없어요!" });
  }
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: tokens || 700,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await response.json();
    const text = data.content?.map((b) => b.text || "").join("") || "";
    return Response.json({ text });
  } catch (e) {
    return Response.json({ text: "오류: " + e.message });
  }
}