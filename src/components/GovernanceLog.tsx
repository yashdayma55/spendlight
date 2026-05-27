"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GovernanceLog {
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

// ─── Single Log Entry ─────────────────────────────────────────────────────────

function LogEntry({ log }: { log: GovernanceLog }) {
  const [expanded, setExpanded] = useState(false);

  const typeStyles = {
    request: "bg-blue-100 text-blue-700",
    response: "bg-green-100 text-green-700",
    error: "bg-red-100 text-red-700",
  };

  const time = new Date(log.timestamp).toLocaleTimeString();

  return (
    <div
      className="border border-gray-100 rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-all"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Summary row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            typeStyles[log.type]
          }`}
        >
          {log.type}
        </span>
        <span className="text-xs text-gray-400 font-mono">{time}</span>
        <span className="text-xs text-gray-600 flex-1 truncate">
          {log.user_message.length > 60
            ? log.user_message.slice(0, 60) + "…"
            : log.user_message}
        </span>
        <span className="text-xs text-gray-400">{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-400">Model</span>
              <p className="font-mono text-gray-700 text-xs">{log.model}</p>
            </div>
            <div>
              <span className="text-gray-400">Context length</span>
              <p className="font-mono text-gray-700">
                {log.context_length} chars
              </p>
            </div>
            {log.input_tokens && (
              <div>
                <span className="text-gray-400">Input tokens</span>
                <p className="font-mono text-gray-700">{log.input_tokens}</p>
              </div>
            )}
            {log.output_tokens && (
              <div>
                <span className="text-gray-400">Output tokens</span>
                <p className="font-mono text-gray-700">{log.output_tokens}</p>
              </div>
            )}
            {log.response_length && (
              <div>
                <span className="text-gray-400">Response length</span>
                <p className="font-mono text-gray-700">
                  {log.response_length} chars
                </p>
              </div>
            )}
            {log.stop_reason && (
              <div>
                <span className="text-gray-400">Stop reason</span>
                <p className="font-mono text-gray-700">{log.stop_reason}</p>
              </div>
            )}
          </div>

          {/* Chunks used */}
          {log.chunks_used && log.chunks_used.length > 0 && (
            <div>
              <span className="text-xs text-gray-400">RAG chunks used</span>
              <div className="flex gap-1 flex-wrap mt-1">
                {log.chunks_used.map((chunk) => (
                  <span
                    key={chunk}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-mono"
                  >
                    {chunk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Error message */}
          {log.error && (
            <div>
              <span className="text-xs text-red-400">Error</span>
              <p className="text-xs text-red-600 font-mono mt-0.5">
                {log.error}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main GovernanceLog Component ─────────────────────────────────────────────

export default function GovernanceLog({ logs }: { logs: GovernanceLog[] }) {
  const [isOpen, setIsOpen] = useState(false);

  const totalTokens = logs.reduce(
    (sum, log) => sum + (log.input_tokens || 0) + (log.output_tokens || 0),
    0
  );

  const errorCount = logs.filter((l) => l.type === "error").length;

  return (
    <div
      className="bg-white rounded-2xl border border-gray-200 p-6"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                logs.length > 0 ? "bg-green-500 animate-pulse" : "bg-gray-300"
              }`}
            />
            <h2 className="text-base font-semibold text-gray-800">
              AI Governance Log
            </h2>
          </div>
          {logs.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {logs.length} entries
              </span>
              {totalTokens > 0 && (
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                  {totalTokens.toLocaleString()} tokens
                </span>
              )}
              {errorCount > 0 && (
                <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                  {errorCount} errors
                </span>
              )}
            </div>
          )}
        </div>
        <span className="text-gray-400 text-sm">{isOpen ? "▲" : "▼"}</span>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-400 mt-1 mb-3">
        Every AI call is logged here — model used, data chunks retrieved,
        tokens consumed. Enterprise governance requirement.
      </p>

      {/* Empty state */}
      {logs.length === 0 && (
        <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
          <p className="text-sm text-gray-400">
            No AI calls made yet. Ask a question or generate insights above.
          </p>
        </div>
      )}

      {/* Log entries */}
      {isOpen && logs.length > 0 && (
        <div className="space-y-2 max-h-72 overflow-y-auto mt-2">
          {logs
            .slice()
            .reverse()
            .map((log, i) => (
              <LogEntry key={i} log={log} />
            ))}
        </div>
      )}
    </div>
  );
}