"use client";

import { useState } from "react";
import Charts from "@/components/Charts";
import ChatBox from "@/components/ChatBox";
import StoryMode from "@/components/StoryMode";
import GovernanceLog from "@/components/GovernanceLog";
import { GovernanceLog as GovernanceLogType } from "@/components/GovernanceLog";
import { PennyProvider } from "@/components/PennyContext";
import PennyIntro from "@/components/PennyIntro";
import AboutSection from "@/components/AboutSection";
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

export default function Home() {
  const [logs, setLogs] = useState<GovernanceLogType[]>([]);

  const addLog = (log: GovernanceLogType) => {
    setLogs((prev) => [...prev, log]);
  };

  const totalB = (FISCAL_METADATA.total_spend / 1e9).toFixed(1);

  return (
    <PennyProvider onNewLog={addLog}>
      <PennyIntro />
      <main className="min-h-screen bg-gray-50 pb-32">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="mb-8">
            <p className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-1">
              Washington State · Fiscal Year 2022
            </p>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Follow the Money
            </h1>
            <p className="text-gray-500 text-base">
              ${totalB}B in public spending ·{" "}
              {formatNumber(FISCAL_METADATA.total_transactions)} payments ·{" "}
              {formatNumber(FISCAL_METADATA.num_vendors)} vendors · Ask anything
              below
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard label="Total spend" value={`$${totalB}B`} />
            <StatCard
              label="Largest agency"
              value="Health Care Authority"
            />
            <StatCard
              label="Vendors paid"
              value={formatNumber(FISCAL_METADATA.num_vendors)}
            />
            <StatCard label="Biggest category" value="Grants & Benefits" />
          </div>

          <div className="mb-6">
            <StoryMode onNewLog={addLog} />
          </div>

          <div className="mb-6">
            <Charts />
          </div>

          <div className="mb-6">
            <ChatBox onNewLog={addLog} />
          </div>

          <div className="mb-6">
            <GovernanceLog logs={logs} />
          </div>

          <AboutSection />

          <p className="text-center text-xs text-gray-300 mt-8">
            Built with Next.js · RAG · Claude API · Washington State Open Data
          </p>
        </div>
      </main>
    </PennyProvider>
  );
}
