"use client";

import { useState, useRef, useEffect } from "react";
import { cleanAiText } from "@/lib/aiFormatting";
import { usePenny } from "./PennyContext";

interface Message {
  role: "user" | "assistant";
  content: string;
  chunksUsed?: string[];
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

const STARTER_QUESTIONS = [
  "Which agency spent the most money?",
  "What was most of the money spent on?",
  "Who are the biggest vendors?",
  "How did spending change month to month?",
  "How much went to healthcare vs transportation?",
  "What share is grants vs goods and services?",
];

function ChunkBadge({ chunk }: { chunk: string }) {
  const colors: Record<string, string> = {
    overview: "bg-blue-100 text-blue-700",
    agencies: "bg-green-100 text-green-700",
    categories: "bg-purple-100 text-purple-700",
    monthly: "bg-orange-100 text-orange-700",
    vendors: "bg-teal-100 text-teal-700",
    agency_category: "bg-pink-100 text-pink-700",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[chunk] || "bg-gray-100 text-gray-600"}`}>
      {chunk}
    </span>
  );
}

export default function ChatBox({
  onNewLog,
  starterQuestions: starterQuestionsProp,
}: {
  onNewLog: (log: GovernanceLog) => void;
  starterQuestions?: readonly string[];
}) {
  const starterQuestions = starterQuestionsProp ?? STARTER_QUESTIONS;
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi there! Ask me anything about Washington State's spending. Try something like \"Why does healthcare get so much money?\" or \"Who are the biggest vendors?\" — I'll explain it in plain English.",
      chunksUsed: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const penny = usePenny();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (question: string) => {
    if (!question.trim() || loading) return;

    const userMessage: Message = { role: "user", content: question };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    penny.showLoading();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.logs) {
        data.logs.forEach((log: GovernanceLog) => onNewLog(log));
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const reply = cleanAiText(
        data.reply || "Sorry, I could not generate a response."
      );
      const assistantMessage: Message = {
        role: "assistant",
        content: reply,
        chunksUsed: data.chunksUsed || [],
      };
      setMessages([...updatedMessages, assistantMessage]);
      penny.speak(reply);
    } catch {
      const errMsg = "Something went wrong. Please try again.";
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: errMsg },
      ]);
      penny.speak(errMsg);
    }

    setLoading(false);
  };

  return (
    <div
      className="bg-white rounded-2xl border border-gray-200 p-6"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">💬</span>
          <h2 className="text-base font-semibold text-gray-800">
            Ask anything about this data
          </h2>
        </div>
        <p className="text-sm text-gray-500">
          Type your question in plain English below. No data skills needed. For
          example: &quot;Why does healthcare get so much money?&quot; or
          &quot;Which companies are paid the most?&quot;
        </p>
      </div>

      {!messages.some((m) => m.role === "user") && (
        <div className="flex flex-wrap gap-2 mb-4">
          {starterQuestions.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="text-sm px-3 py-1.5 rounded-full bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-600 transition-all border border-gray-200"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="max-h-80 overflow-y-auto mb-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[80%]">
              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}>
                {m.content}
              </div>
              {m.role === "assistant" && m.chunksUsed && m.chunksUsed.length > 0 && (
                <div className="flex gap-1 mt-1 flex-wrap">
                  <span className="text-xs text-gray-400">Sources:</span>
                  {m.chunksUsed.map((chunk) => (
                    <ChunkBadge key={chunk} chunk={chunk} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2.5 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          placeholder="e.g. Why did the Health Care Authority spend so much?"
          className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Ask ↗
        </button>
      </div>
    </div>
  );
}
