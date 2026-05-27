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

const STAT_DETAILS = {
  "Total Spend": {
    value: "$29.5B",
    icon: "💰",
    color: "blue" as const,
    detail:
      "Washington State paid out $29,535,369,459 across 451,029 individual transactions in Fiscal Year 2022. That works out to roughly $3,800 for every person living in Washington State.",
    subtext: "FY2022 total vendor payments",
  },
  "Largest Agency": {
    value: "Health Care Authority",
    icon: "🏥",
    color: "green" as const,
    detail:
      "The Health Care Authority received $13.1 billion — that's 44 cents of every dollar the state spent. Most of this funds Medicaid managed care, paying health insurance companies to cover low-income residents.",
    subtext: "$13.1B — 44% of total budget",
  },
  "Vendors Paid": {
    value: "65,494",
    icon: "🏢",
    color: "purple" as const,
    detail:
      "Washington State paid 65,494 unique vendors in FY2022 — from giant healthcare companies receiving billions to small local contractors receiving a few hundred dollars. The top 10 vendors alone account for over 40% of all spending.",
    subtext: "Unique businesses and organizations",
  },
  "Biggest Category": {
    value: "Grants & Benefits",
    icon: "🤝",
    color: "orange" as const,
    detail:
      "Grants, Benefits and Client Services account for $23.3 billion — 79% of all spending. This is direct money going to people: Medicaid payments, housing assistance, food benefits, and social services. Less than 13% goes to buying goods and services.",
    subtext: "$23.3B — 79% of all spending",
  },
};

function StatCard({ statKey }: { statKey: keyof typeof STAT_DETAILS }) {
  const [expanded, setExpanded] = useState(false);
  const stat = STAT_DETAILS[statKey];

  const colorMap = {
    blue: "hover:border-blue-300 hover:bg-blue-50",
    green: "hover:border-green-300 hover:bg-green-50",
    purple: "hover:border-purple-300 hover:bg-purple-50",
    orange: "hover:border-orange-300 hover:bg-orange-50",
  };

  const iconBgMap = {
    blue: "bg-blue-100",
    green: "bg-green-100",
    purple: "bg-purple-100",
    orange: "bg-orange-100",
  };

  return (
    <div
      className={`bg-white rounded-xl border-2 border-gray-200 p-4 cursor-pointer transition-all duration-200 ${colorMap[stat.color]} ${expanded ? "border-gray-300 shadow-md" : ""}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
            {statKey}
          </p>
          <p className="text-xl font-bold text-gray-800">{stat.value}</p>
          <p className="text-xs text-gray-400 mt-0.5">{stat.subtext}</p>
        </div>
        <div
          className={`w-9 h-9 rounded-lg ${iconBgMap[stat.color]} flex items-center justify-center text-lg`}
        >
          {stat.icon}
        </div>
      </div>

      {!expanded && (
        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
          <span>Click to learn more</span>
          <span>↓</span>
        </p>
      )}

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600 leading-relaxed">{stat.detail}</p>
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <span>Click to collapse</span>
            <span>↑</span>
          </p>
        </div>
      )}
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
            <div className="mb-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                S
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                  Spendlight
                </h1>
                <p className="text-xs text-gray-400 font-mono uppercase tracking-widest">
                  Washington State · Fiscal Year 2022
                </p>
              </div>
            </div>
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
            <StatCard statKey="Total Spend" />
            <StatCard statKey="Largest Agency" />
            <StatCard statKey="Vendors Paid" />
            <StatCard statKey="Biggest Category" />
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
            <ChatBox
              onNewLog={addLog}
              starterQuestions={selectedPersona?.starterQuestions}
            />
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
