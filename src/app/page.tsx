"use client";

import { useEffect, useState } from "react";
import Charts from "@/components/Charts";
import ChatBox from "@/components/ChatBox";
import StoryMode from "@/components/StoryMode";
import GovernanceLog from "@/components/GovernanceLog";
import { GovernanceLog as GovernanceLogType } from "@/components/GovernanceLog";
import { PennyProvider, usePenny } from "@/components/PennyContext";
import PennyIntro from "@/components/PennyIntro";
import AboutSection from "@/components/AboutSection";
import PersonaSelector, { type Persona } from "@/components/PersonaSelector";
import HowToUse from "@/components/HowToUse";
import WelcomeScreen from "@/components/WelcomeScreen";
import { FISCAL_METADATA } from "@/lib/data";

const formatNumber = (n: number) =>
  n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-xl font-semibold text-gray-800">{value}</p>
    </div>
  );
}

function HomeContent({
  logs,
  addLog,
  selectedPersona,
  onPersonaSelect,
}: {
  logs: GovernanceLogType[];
  addLog: (log: GovernanceLogType) => void;
  selectedPersona: Persona | null;
  onPersonaSelect: (persona: Persona) => void;
}) {
  const penny = usePenny();
  const totalB = (FISCAL_METADATA.total_spend / 1e9).toFixed(1);

  return (
    <>
      <PennyIntro />
      <main
        className="min-h-screen bg-gray-50 pb-32"
        onClick={(e) => {
          const target = e.target as HTMLElement;
          const isBackground =
            target.tagName === "MAIN" ||
            target.classList.contains("bg-gray-50") ||
            target.closest(".dismiss-penny") !== null;
          if (isBackground) {
            penny.dismiss();
          }
        }}
      >
        <div className="max-w-5xl mx-auto px-4 py-10">
          {/* 1. Header */}
          <div className="mb-8 dismiss-penny">
            <p className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">
              Washington State · Fiscal Year 2022 · Public Data
            </p>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Follow the Money 💰
            </h1>
            <p className="text-lg text-gray-600 mb-2 max-w-2xl">
              Washington State spent <strong>$29.5 billion</strong> of public
              money in 2022. This tool helps you understand where it went — no
              spreadsheets, no SQL, no data skills needed.
            </p>
            <p className="text-sm text-blue-600 font-medium">
              👇 Start by clicking &quot;Find the story&quot; below — or ask
              Penny anything by clicking her in the bottom right corner.
            </p>
          </div>

          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
            onClick={(e) => e.stopPropagation()}
          >
            <StatCard label="Total spend" value={`$${totalB}B`} />
            <StatCard label="Largest agency" value="Health Care Authority" />
            <StatCard
              label="Vendors paid"
              value={formatNumber(FISCAL_METADATA.num_vendors)}
            />
            <StatCard label="Biggest category" value="Grants & Benefits" />
          </div>

          {/* 2. Persona selector */}
          <div onClick={(e) => e.stopPropagation()}>
            <PersonaSelector onSelect={onPersonaSelect} />
          </div>

          {/* 3. Story Mode */}
          <div className="mb-6" onClick={(e) => e.stopPropagation()}>
            <StoryMode onNewLog={addLog} />
          </div>

          {/* 4. How this works */}
          <div onClick={(e) => e.stopPropagation()}>
            <HowToUse />
          </div>

          {/* 5. Charts */}
          <div className="mb-6" onClick={(e) => e.stopPropagation()}>
            <Charts />
          </div>

          {/* 6. Chat */}
          <div className="mb-6" onClick={(e) => e.stopPropagation()}>
            <ChatBox onNewLog={addLog} />
          </div>

          {/* 7. Governance Log */}
          <div className="mb-6" onClick={(e) => e.stopPropagation()}>
            <GovernanceLog logs={logs} />
          </div>

          {/* 8. About */}
          <div onClick={(e) => e.stopPropagation()}>
            <AboutSection />
          </div>

          {/* 9. Footer */}
          <p className="text-center text-xs text-gray-300 mt-8 dismiss-penny">
            Built with Next.js · RAG · Claude API · Washington State Open Data
          </p>
        </div>
      </main>
    </>
  );
}

export default function Home() {
  const [logs, setLogs] = useState<GovernanceLogType[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  const addLog = (log: GovernanceLogType) => {
    setLogs((prev) => [...prev, log]);
  };

  if (showWelcome) {
    return <WelcomeScreen />;
  }

  return (
    <PennyProvider onNewLog={addLog}>
      <HomeContent
        logs={logs}
        addLog={addLog}
        selectedPersona={selectedPersona}
        onPersonaSelect={setSelectedPersona}
      />
    </PennyProvider>
  );
}
