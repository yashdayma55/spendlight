"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { CLAUDE_MODEL } from "@/lib/claude";
import { PennyCharacter, type PennyAnimation } from "./Penny";
import type { GovernanceLog } from "./GovernanceLog";

export const PENNY_INTRO =
  "Hi! I'm Penny, your spending guide 👋 Washington State spent $29.5B in FY2022 across 65,494 vendors. Click any chart bar, data point, or pie slice and I'll explain exactly what it means in plain English!";

function ThinkingBubble() {
  return (
    <div className="flex items-center gap-1">
      <span className="text-sm text-gray-500">Penny is thinking</span>
      <div className="flex gap-0.5">
        <div
          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <div
          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <div
          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}

interface PennyContextValue {
  explain: (context: string) => Promise<void>;
  speak: (text: string) => void;
  showIntroduction: () => void;
  showLoading: () => void;
  dismiss: () => void;
}

const PennyContext = createContext<PennyContextValue | null>(null);

export function usePenny(): PennyContextValue {
  const ctx = useContext(PennyContext);
  if (!ctx) {
    throw new Error("usePenny must be used within PennyProvider");
  }
  return ctx;
}

export function PennyProvider({
  children,
  onNewLog,
}: {
  children: ReactNode;
  onNewLog: (log: GovernanceLog) => void;
}) {
  const [animation, setAnimation] = useState<PennyAnimation>("idle");
  const [bubbleText, setBubbleText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);

  const dismiss = useCallback(() => {
    setBubbleVisible(false);
    setIsLoading(false);
    setBubbleText(null);
    setAnimation("idle");
  }, []);

  const showBubbleContent = useCallback((text: string | null, loading: boolean) => {
    setBubbleVisible(true);
    setIsLoading(loading);
    setBubbleText(text);
  }, []);

  const speak = useCallback(
    (text: string) => {
      setAnimation("talking");
      setIsLoading(false);
      setBubbleText(text);
      setBubbleVisible(true);
    },
    []
  );

  const showIntroduction = useCallback(() => {
    speak(PENNY_INTRO);
  }, [speak]);

  const showLoading = useCallback(() => {
    setAnimation("thinking");
    showBubbleContent(null, true);
  }, [showBubbleContent]);

  const explain = useCallback(
    async (context: string) => {
      setAnimation("thinking");
      showBubbleContent(null, true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: context,
            messages: [{ role: "user", content: context }],
            pennyMode: true,
          }),
        });

        if (!response.ok) {
          throw new Error(`API call failed: ${response.status}`);
        }

        const data = await response.json();

        if (data.logs) {
          data.logs.forEach((log: GovernanceLog) => onNewLog(log));
        }

        if (data.error) {
          throw new Error(data.error);
        }

        const reply = data.reply;
        if (!reply) {
          throw new Error("No reply from API");
        }

        speak(reply);
      } catch (error) {
        console.error("Penny API error:", error);
        speak("Hmm, let me think about that one a bit more...");
        onNewLog({
          timestamp: new Date().toISOString(),
          type: "error",
          model: CLAUDE_MODEL,
          user_message: `PENNY: ${context}`,
          chunks_used: [],
          context_length: 0,
          error:
            error instanceof Error ? error.message : "Penny explain request failed",
        });
      }
    },
    [onNewLog, showBubbleContent, speak]
  );

  const handlePennyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    showIntroduction();
  };

  const hasSpeech = bubbleVisible && (isLoading || bubbleText);

  return (
    <PennyContext.Provider
      value={{ explain, speak, showIntroduction, showLoading, dismiss }}
    >
      {children}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        {hasSpeech && (
          <div
            className={`max-w-[280px] sm:max-w-xs bg-white border border-blue-100 rounded-2xl rounded-br-sm shadow-lg px-4 py-3 text-sm text-gray-700 leading-relaxed penny-bubble-enter ${
              bubbleVisible ? "opacity-100" : "opacity-0"
            }`}
            role="status"
            aria-live="polite"
          >
            <p className="font-semibold text-blue-700 text-xs mb-1">Penny</p>
            {isLoading ? <ThinkingBubble /> : bubbleText}
          </div>
        )}

        {!hasSpeech && (
          <p className="text-xs text-gray-400 text-center animate-pulse pointer-events-none">
            Click me!
          </p>
        )}

        <div className="relative pointer-events-auto">
          {!hasSpeech && (
            <div className="absolute inset-0 rounded-full animate-ping bg-blue-200 opacity-30 scale-110 pointer-events-none" />
          )}
          <div
            onClick={handlePennyClick}
            className="relative cursor-pointer"
            title="Click me for help!"
            role="button"
            aria-label="Penny, your spending guide — click for help"
          >
            <PennyCharacter animation={animation} />
          </div>
        </div>
      </div>
    </PennyContext.Provider>
  );
}
