"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from "recharts";
import {
  AGENCY_TOTALS,
  CATEGORY_TOTALS,
  MONTHLY_SPEND,
  TOP_VENDORS,
} from "@/lib/data";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${(n / 1e3).toFixed(0)}K`;
};

const COLORS = [
  "#1d4ed8", "#0f766e", "#b45309", "#7c3aed",
  "#be185d", "#065f46", "#92400e", "#1e40af",
  "#6d28d9", "#047857",
];

// ─── Tab Button ───────────────────────────────────────────────────────────────

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
        active
          ? "bg-blue-600 text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-md">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-sm text-blue-600 font-bold">
          {fmt(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}

// ─── Chart: Agencies ─────────────────────────────────────────────────────────

function AgencyChart() {
  const data = Object.entries(AGENCY_TOTALS)
    .slice(0, 10)
    .map(([name, value]) => ({
      name: name.length > 20 ? name.slice(0, 20) + "…" : name,
      value,
    }));

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        Top 10 agencies by total spend — Health Care Authority alone accounts
        for 44% of the entire state budget.
      </p>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 40 }}>
          <XAxis type="number" tickFormatter={fmt} tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={160} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill="#1d4ed8" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Chart: Categories ───────────────────────────────────────────────────────

function CategoryChart() {
  const data = Object.entries(CATEGORY_TOTALS).map(([name, value]) => ({
    name,
    value,
  }));

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        79% of all spending is Grants, Benefits and Client Services — direct
        payments to people and service providers.
      </p>
      <div className="flex flex-col md:flex-row items-center gap-6">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={110}
              label={({ name, value }) =>
                `${((value / total) * 100).toFixed(0)}%`
              }
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => fmt(value)} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-2 min-w-[200px]">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="text-xs text-gray-600">
                {d.name.length > 28 ? d.name.slice(0, 28) + "…" : d.name}
              </span>
              <span className="text-xs font-medium text-gray-800 ml-auto">
                {fmt(d.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Chart: Monthly ───────────────────────────────────────────────────────────

function MonthlyChart() {
  const data = Object.entries(MONTHLY_SPEND).map(([month, value]) => ({
    month,
    value,
  }));

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        Spending peaks in July ($3.4B) and September ($3.2B) — the start of
        the fiscal year when annual grants and contracts are issued.
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ left: 10, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={fmt} tick={{ fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#1d4ed8"
            strokeWidth={2.5}
            dot={{ fill: "#1d4ed8", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Chart: Vendors ───────────────────────────────────────────────────────────

function VendorChart() {
  const data = Object.entries(TOP_VENDORS)
    .slice(0, 10)
    .map(([name, value]) => ({
      name: name.length > 22 ? name.slice(0, 22) + "…" : name,
      value,
    }));

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        The top 6 vendors are all healthcare companies — reflecting how
        dominant managed care contracts are in the state budget.
      </p>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 40 }}>
          <XAxis type="number" tickFormatter={fmt} tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={170} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill="#0f766e" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Main Charts Component ────────────────────────────────────────────────────

type TabType = "agencies" | "categories" | "monthly" | "vendors";

export default function Charts() {
  const [activeTab, setActiveTab] = useState<TabType>("agencies");

  const tabs: { key: TabType; label: string }[] = [
    { key: "agencies", label: "By Agency" },
    { key: "categories", label: "By Type" },
    { key: "monthly", label: "Month by Month" },
    { key: "vendors", label: "Top Vendors" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      {/* Tab buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <TabButton
            key={tab.key}
            label={tab.label}
            active={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
          />
        ))}
      </div>

      {/* Chart content */}
      {activeTab === "agencies" && <AgencyChart />}
      {activeTab === "categories" && <CategoryChart />}
      {activeTab === "monthly" && <MonthlyChart />}
      {activeTab === "vendors" && <VendorChart />}
    </div>
  );
}