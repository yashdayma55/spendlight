// API Route — handles all chat requests
// This is the bridge between the frontend and Claude
// Every AI call is logged here (governance requirement)

import { NextRequest, NextResponse } from "next/server";
import { buildContext } from "@/lib/rag";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface GovernanceLog {
  timestamp: string;
  type: "request" | "response" | "error";
  model: string;
  user_message: string;
  chunks_used: string[];
  context_length: number;
  response_length?: number;
  input_tokens?: number;
  output_tokens?: number;
  stop_reason?: string;
  error?: string;
}

// ─── System Prompt ────────────────────────────────────────────────────────────
// This tells Claude who it is and how to behave
// It receives relevant data chunks as context at runtime

function buildSystemPrompt(context: string): string {
  return `You are a helpful assistant explaining Washington State government spending data to a non-technical user — think a journalist, city councilmember, or engaged citizen.

Here is the relevant spending data to answer the user's question:

${context}

Rules:
1. Keep answers short, clear and jargon-free — 2 to 4 sentences max
2. Always put numbers in context — say "that is 44% of the total budget" not just "$13B"
3. Never use SQL, code, or technical terms
4. If the question is outside this data, say so honestly
5. Be warm and curious — this is public money, people have a right to understand it
6. End with a short follow-up suggestion when relevant`;
}

// ─── POST Handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const logs: GovernanceLog[] = [];

  try {
    const body = await request.json();
    const { messages, question } = body as {
      messages: Message[];
      question: string;
    };

    // Step 1 — Run RAG to find relevant chunks
    const { context, chunksUsed } = buildContext(question);

    // Step 2 — Build governance log entry for this request
    const requestLog: GovernanceLog = {
      timestamp: new Date().toISOString(),
      type: "request",
      model: "claude-sonnet-4-20250514",
      user_message: question,
      chunks_used: chunksUsed,
      context_length: context.length,
    };
    logs.push(requestLog);

    // Step 3 — Call Claude API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: buildSystemPrompt(context),
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || "Unable to generate a response.";

    // Step 4 — Log the response (governance requirement)
    const responseLog: GovernanceLog = {
      timestamp: new Date().toISOString(),
      type: "response",
      model: "claude-sonnet-4-20250514",
      user_message: question,
      chunks_used: chunksUsed,
      context_length: context.length,
      response_length: reply.length,
      input_tokens: data.usage?.input_tokens,
      output_tokens: data.usage?.output_tokens,
      stop_reason: data.stop_reason,
    };
    logs.push(responseLog);

    // Step 5 — Return answer + logs to frontend
    return NextResponse.json({
      reply,
      logs,
      chunksUsed,
    });

  } catch (error) {
    const errorLog: GovernanceLog = {
      timestamp: new Date().toISOString(),
      type: "error",
      model: "claude-sonnet-4-20250514",
      user_message: "unknown",
      chunks_used: [],
      context_length: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
    logs.push(errorLog);

    return NextResponse.json(
      { error: "Something went wrong", logs },
      { status: 500 }
    );
  }
}