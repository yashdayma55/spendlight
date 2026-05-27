"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CLAUDE_MODEL } from "@/lib/claude";
import { PennyCharacter, type PennyAnimation } from "./Penny";
import type { GovernanceLog } from "./GovernanceLog";

const BUBBLE_DISMISS_MS = 8000;

interface PennyContextValue {
  explain: (context: string) => Promise<void>;
  speak: (text: string) => void;
  setThinking: () => void;
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
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDismissTimer = useCallback(() => {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }
  }, []);

  const hideBubble = useCallback(() => {
    clearDismissTimer();
    setBubbleVisible(false);
    setTimeout(() => {
      setBubbleText(null);
      setAnimation("idle");
    }, 200);
  }, [clearDismissTimer]);

  const showBubble = useCallback(
    (text: string) => {
      clearDismissTimer();
      setBubbleText(text);
      setBubbleVisible(true);
      dismissTimer.current = setTimeout(hideBubble, BUBBLE_DISMISS_MS);
    },
    [clearDismissTimer, hideBubble]
  );

  const speak = useCallback(
    (text: string) => {
      setAnimation("talking");
      showBubble(text);
    },
    [showBubble]
  );

  const setThinking = useCallback(() => {
    setAnimation("thinking");
    setBubbleVisible(false);
  }, []);

  const explain = useCallback(
    async (context: string) => {
      setThinking();

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
          error: error instanceof Error ? error.message : "Penny explain request failed",
        });
      }
    },
    [onNewLog, setThinking, speak]
  );

  useEffect(() => {
    const onDocumentClick = () => {
      if (bubbleVisible) hideBubble();
    };
    document.addEventListener("click", onDocumentClick);
    return () => document.removeEventListener("click", onDocumentClick);
  }, [bubbleVisible, hideBubble]);

  useEffect(() => () => clearDismissTimer(), [clearDismissTimer]);

  return (
    <PennyContext.Provider value={{ explain, speak, setThinking }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 pointer-events-none"
        onClick={(e) => e.stopPropagation()}
      >
        {bubbleText && (
          <div
            className={`pointer-events-auto max-w-[280px] sm:max-w-xs bg-white border border-blue-100 rounded-2xl rounded-br-sm shadow-lg px-4 py-3 text-sm text-gray-700 leading-relaxed ${
              bubbleVisible ? "penny-bubble-enter opacity-100" : "opacity-0"
            }`}
            role="status"
            aria-live="polite"
          >
            <p className="font-semibold text-blue-700 text-xs mb-1">Penny</p>
            {bubbleText}
          </div>
        )}
        <div className="pointer-events-auto">
          <PennyCharacter animation={animation} />
        </div>
      </div>
    </PennyContext.Provider>
  );
}
