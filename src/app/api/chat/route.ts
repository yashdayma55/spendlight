// API Route — handles all chat requests
// This is the bridge between the frontend and Claude
// Every AI call is logged here (governance requirement)

import { NextRequest, NextResponse } from "next/server";
import { CLAUDE_MODEL } from "@/lib/claude";
import { buildContext } from "@/lib/rag";

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

function buildSystemPrompt(context: string, pennyMode?: boolean): string {
  if (pennyMode) {
    return `You are Penny, a friendly cartoon financial analyst helping a non-technical user explore Washington State FY2022 spending ($29.5B).

Here is relevant spending data:

${context}

Rules:
1. Reply in exactly 2 short sentences of plain English
2. Put dollar amounts in context (percent of total budget when useful)
3. Never use SQL, code, or jargon
4. Be warm and conversational — you are a guide, not a report`;
  }

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

export async function POST(request: NextRequest) {
  const logs: GovernanceLog[] = [];
  let question = "unknown";

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not set", logs: [] },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const {
      messages,
      question: userQuestion,
      pennyMode,
      storyMode,
    } = body as {
      messages: Message[];
      question: string;
      pennyMode?: boolean;
      storyMode?: boolean;
    };

    question = userQuestion;

    const { context, chunksUsed } = storyMode
      ? { context: userQuestion, chunksUsed: ["all"] }
      : buildContext(userQuestion);

    const requestLog: GovernanceLog = {
      timestamp: new Date().toISOString(),
      type: "request",
      model: CLAUDE_MODEL,
      user_message: userQuestion,
      chunks_used: chunksUsed,
      context_length: context.length,
    };
    logs.push(requestLog);

    const systemPrompt = storyMode
      ? "You are a data journalist. Follow the user instructions exactly. Respond only with valid JSON — no markdown, no extra text."
      : buildSystemPrompt(context, pennyMode);

    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: pennyMode ? 256 : 1024,
        system: systemPrompt,
        messages: messages.map((m: Message) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!claudeResponse.ok) {
      const errorBody = await claudeResponse.text();
      throw new Error(
        `Claude API returned ${claudeResponse.status}: ${errorBody}`
      );
    }

    const data = await claudeResponse.json();
    const reply = data.content?.[0]?.text || "Unable to generate a response.";

    const responseLog: GovernanceLog = {
      timestamp: new Date().toISOString(),
      type: "response",
      model: CLAUDE_MODEL,
      user_message: userQuestion,
      chunks_used: chunksUsed,
      context_length: context.length,
      response_length: reply.length,
      input_tokens: data.usage?.input_tokens,
      output_tokens: data.usage?.output_tokens,
      stop_reason: data.stop_reason,
    };
    logs.push(responseLog);

    return NextResponse.json({
      reply,
      logs,
      chunksUsed,
    });
  } catch (error) {
    console.error("FULL ERROR:", error);

    const errorMessage =
      error instanceof Error ? error.message : JSON.stringify(error);

    const errorLog: GovernanceLog = {
      timestamp: new Date().toISOString(),
      type: "error",
      model: CLAUDE_MODEL,
      user_message: question,
      chunks_used: [],
      context_length: 0,
      error: errorMessage,
    };
    logs.push(errorLog);

    return NextResponse.json({ error: errorMessage, logs }, { status: 500 });
  }
}
