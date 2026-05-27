"use client";

import { useState } from "react";
import { CLAUDE_MODEL } from "@/lib/claude";
import { usePenny } from "./PennyContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Insight {
  headline: string;
  explanation: string;
  category: "surprising" | "trending" | "concerning" | "notable";
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

// ─── Category styles ──────────────────────────────────────────────────────────

const categoryConfig = {
  surprising: {
    label: "Surprising",
    bg: "bg-purple-50",
    border: "border-purple-200",
    badge: "bg-purple-100 text-purple-700",
    icon: "💡",
  },
  trending: {
    label: "Trend",
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    icon: "📈",
  },
  concerning: {
    label: "Notable",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    icon: "🔍",
  },
  notable: {
    label: "Key fact",
    bg: "bg-green-50",
    border: "border-green-200",
    badge: "bg-green-100 text-green-700",
    icon: "✓",
  },
};

// ─── Story prompt ─────────────────────────────────────────────────────────────
// This is what we send to Claude to generate the insights
// We give it all the key data and ask for 3 newsworthy findings

const STORY_PROMPT = `You are a data journalist analyzing Washington State's FY2022 spending data. 

Here is the key data:
- Total spend: $29.5 billion across 451,029 payments
- Health Care Authority: $13.1B (44% of total budget)
- Social and Health Services: $6.0B (20%)
- Transportation: $1.75B, Health: $1.45B, Commerce: $1.42B
- 79% of all spending is Grants/Benefits — direct payments to people
- Top vendor: Molina Healthcare $4.55B — more than the entire Transportation budget
- Top 6 vendors are ALL healthcare companies
- Monthly spending peaks: July $3.4B, September $3.2B, December $3.2B
- 65,494 unique vendors were paid
- Corrections department: $400M

Your job: Find exactly 3 newsworthy, surprising, or important insights from this data.

Respond ONLY with a valid JSON array. No other text. No markdown. No explanation outside the JSON.

Format:
[
  {
    "headline": "Short punchy headline under 12 words",
    "explanation": "2 sentence explanation a non-technical person would understand",
    "category": "surprising" | "trending" | "concerning" | "notable"
  }
]`;

// ─── Main StoryMode Component ─────────────────────────────────────────────────

export default function StoryMode({
  onNewLog,
}: {
  onNewLog: (log: GovernanceLog) => void;
}) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const penny = usePenny();

  const generateStory = async () => {
    setLoading(true);
    setError("");
    penny.explain(
      "The user clicked Generate insights to find newsworthy stories in Washington State FY2022 spending data. Say you are looking for the most interesting stories in the data — exactly 1 short enthusiastic sentence."
    );

    // Log the request (governance requirement)
    onNewLog({
      timestamp: new Date().toISOString(),
      type: "request",
      model: CLAUDE_MODEL,
      user_message: "STORY_MODE: generate top insights",
      chunks_used: ["all"],
      context_length: STORY_PROMPT.length,
    });

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question:
            "Generate top 3 newsworthy insights from Washington State spending data as JSON",
          messages: [{ role: "user", content: STORY_PROMPT }],
          storyMode: true,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.logs) {
        data.logs.forEach((log: GovernanceLog) => onNewLog(log));
      }

      // Parse the JSON insights from Claude's response
      const raw = data.reply || "[]";
      const cleaned = raw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed: Insight[] = JSON.parse(cleaned);
      setInsights(parsed);
      setGenerated(true);
    } catch (err) {
      setError("Could not generate insights. Please try again.");
      onNewLog({
        timestamp: new Date().toISOString(),
        type: "error",
        model: CLAUDE_MODEL,
        user_message: "STORY_MODE: generate top insights",
        chunks_used: [],
        context_length: 0,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }

    setLoading(false);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      className="bg-white rounded-2xl border border-gray-200 p-6"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
              1
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              Start here — get the story in seconds
            </h2>
          </div>
          <p className="text-sm text-gray-500 ml-9">
            Not sure where to begin? Click the button and AI will instantly find
            the 3 most surprising, newsworthy findings in this $29.5B dataset. No
            data skills needed — just one click.
          </p>
        </div>

        {!generated && (
          <button
            onClick={generateStory}
            disabled={loading}
            className="px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 whitespace-nowrap shadow-sm"
          >
            {loading ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Finding stories…
              </>
            ) : (
              "✨ Find the story ↗"
            )}
          </button>
        )}

        {generated && (
          <button
            onClick={() => {
              setInsights([]);
              setGenerated(false);
            }}
            className="text-sm text-gray-400 hover:text-gray-600 transition-all whitespace-nowrap"
          >
            ↺ Regenerate
          </button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}

      {/* Insights grid */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {insights.map((insight, i) => {
            const config = categoryConfig[insight.category] || categoryConfig.notable;
            return (
              <div
                key={i}
                className={`rounded-xl border p-4 ${config.bg} ${config.border}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.badge}`}>
                    {config.icon} {config.label}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-800 mb-1.5 leading-snug">
                  {insight.headline}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-3">
                  {insight.explanation}
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      `${insight.headline}\n\n${insight.explanation}`
                    );
                    setCopiedIndex(i);
                    setTimeout(() => setCopiedIndex(null), 2000);
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-all flex items-center gap-1"
                >
                  {copiedIndex === i ? "✓ Copied!" : "📋 Copy this insight"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!generated && !loading && (
        <div className="mt-2 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
          <p className="text-sm text-gray-400">
            Click "Generate insights" to see what's most newsworthy in this data
          </p>
        </div>
      )}
    </div>
  );
}