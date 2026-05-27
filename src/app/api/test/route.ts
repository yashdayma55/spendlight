import { NextResponse } from "next/server";
import { CLAUDE_MODEL } from "@/lib/claude";

export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      status: "error",
      message: "API key not found",
    });
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
        model: CLAUDE_MODEL,
        max_tokens: 50,
        messages: [{ role: "user", content: "Say hello in 5 words" }],
      }),
    });

    const data = await response.json();

    return NextResponse.json({
      status: response.ok ? "success" : "error",
      http_status: response.status,
      model: CLAUDE_MODEL,
      reply: data.content?.[0]?.text,
      error: data.error,
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
