"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import {
  AGENCY_TOTALS,
  CATEGORY_TOTALS,
  MONTHLY_SPEND,
  TOP_VENDORS,
  FISCAL_METADATA,
} from "@/lib/data";
import { usePenny } from "./PennyContext";

const fmt = (n: number) => {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${(n / 1e3).toFixed(0)}K`;
};

const COLORS = [
  "#1d4ed8",
  "#0f766e",
  "#b45309",
  "#7c3aed",
  "#be185d",
  "#065f46",
  "#92400e",
  "#1e40af",
  "#6d28d9",
  "#047857",
];

const TAB_HINTS: Record<TabType, string> = {
  agencies: "Top agencies by total spend — click any bar to learn more",
  categories: "Spending by category — click any slice to learn more",
  monthly: "Monthly spending in FY2022 — click any point to learn more",
  vendors: "Top vendors paid — click any bar to learn more",
};

const TAB_ORIENTATION: Record<TabType, string> = {
  agencies:
    "This view shows which state agencies spent the most money in FY2022.",
  categories:
    "This chart breaks spending down by type — grants, goods, capital projects, and more.",
  monthly:
    "Here you can see how spending flowed month by month across the fiscal year.",
  vendors:
    "These are the companies and organizations that received the most payments.",
};

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

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-md">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-sm text-blue-600 font-bold">{fmt(payload[0].value)}</p>
      </div>
    );
  }
  return null;
}

function MonthTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-md">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-sm text-blue-600 font-bold">{fmt(payload[0].value)}</p>
        <p className="text-xs text-blue-500 mt-1 italic">Click to learn more</p>
      </div>
    );
  }
  return null;
}

function ClickHint() {
  return (
    <p className="text-xs text-blue-500 mt-2 italic">
      Click any bar to learn more
    </p>
  );
}

function AgencyChart({ onBarClick }: { onBarClick: (name: string, value: number) => void }) {
  const data = Object.entries(AGENCY_TOTALS)
    .slice(0, 10)
    .map(([name, value]) => ({
      name: name.length > 20 ? name.slice(0, 20) + "…" : name,
      fullName: name,
      value,
    }));

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        Top 10 agencies by total spend — Health Care Authority alone accounts
        for 44% of the entire state budget.
      </p>
      <p className="text-xs text-blue-500 mb-3 font-medium">
        💡 Click any bar and Penny will explain what that agency does and why
        they spent this amount
      </p>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 40 }}>
          <XAxis type="number" tickFormatter={fmt} tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={160} />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="value"
            fill="#1d4ed8"
            radius={[0, 4, 4, 0]}
            className="cursor-pointer hover:opacity-80"
            onClick={(barData) => {
              const row = (barData as { payload?: { fullName: string; value: number } })
                .payload;
              if (row) onBarClick(row.fullName, row.value);
            }}
          />
        </BarChart>
      </ResponsiveContainer>
      <ClickHint />
    </div>
  );
}

function CategoryChart({
  onSliceClick,
}: {
  onSliceClick: (name: string, value: number) => void;
}) {
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
      <p className="text-xs text-blue-500 mb-3 font-medium">
        💡 Click any slice to understand what this category of spending means
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
              className="cursor-pointer"
              label={({ name, value }) =>
                `${name}: ${((value / total) * 100).toFixed(0)}%`
              }
              onClick={(_, index) => {
                const item = data[index];
                if (item) onSliceClick(item.name, item.value);
              }}
            >
              {data.map((_, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => fmt(Number(value))} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-2 min-w-[200px]">
          {data.map((d, i) => (
            <button
              key={d.name}
              type="button"
              onClick={() => onSliceClick(d.name, d.value)}
              className="flex items-center gap-2 text-left hover:bg-gray-50 rounded p-1 transition-colors"
            >
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
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-blue-500 mt-2 italic">
        Click any slice to learn more
      </p>
    </div>
  );
}

function MonthlyChart({
  onPennyExplain,
}: {
  onPennyExplain: (context: string) => void;
}) {
  const data = Object.entries(MONTHLY_SPEND).map(([month, value]) => ({
    month,
    value,
  }));

  const monthlyAverage =
    Object.values(MONTHLY_SPEND).reduce((a, b) => a + b, 0) / 12;

  const buildMonthContext = (month: string, amount: number) => {
    const amountFormatted = `$${(amount / 1e9).toFixed(1)}B`;
    const avg = monthlyAverage;
    const aboveBelow = amount > avg ? "above" : "below";

    return `The user clicked on ${month} in the monthly spending chart. 
    ${month} had spending of ${amountFormatted}. 
    The monthly average is $${(avg / 1e9).toFixed(1)}B so this month is ${aboveBelow} average.
    Fiscal year starts in July. Peaks happen in July, September and December 
    when annual grants and contracts are issued.
    Explain this month's spending in 2 plain English sentences.`;
  };

  const handleMonthClick = (chartState: unknown) => {
    const state = chartState as {
      activeLabel?: string;
      activePayload?: { value: number }[];
    };
    if (state?.activePayload?.[0] && state.activeLabel) {
      const month = state.activeLabel;
      const amount = state.activePayload[0].value;
      onPennyExplain(buildMonthContext(month, amount));
    }
  };

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        Spending peaks in July ($3.4B) and September ($3.2B) — the start of
        the fiscal year when annual grants and contracts are issued.
      </p>
      <p className="text-xs text-blue-500 mb-3 font-medium">
        💡 Click any data point to understand why spending was high or low that
        month
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ left: 10, right: 20 }}
          onClick={handleMonthClick}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={fmt} tick={{ fontSize: 11 }} />
          <Tooltip content={<MonthTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#1d4ed8"
            strokeWidth={2.5}
            dot={{
              fill: "#1d4ed8",
              r: 6,
              cursor: "pointer",
              strokeWidth: 2,
            }}
            activeDot={{ r: 9, cursor: "pointer" }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs text-blue-500 mt-2 italic">
        Click any point to learn more
      </p>
    </div>
  );
}

function VendorChart({ onBarClick }: { onBarClick: (name: string, value: number) => void }) {
  const data = Object.entries(TOP_VENDORS)
    .slice(0, 10)
    .map(([name, value]) => ({
      name: name.length > 22 ? name.slice(0, 22) + "…" : name,
      fullName: name,
      value,
    }));

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        The top 6 vendors are all healthcare companies — reflecting how
        dominant managed care contracts are in the state budget.
      </p>
      <p className="text-xs text-blue-500 mb-3 font-medium">
        💡 Click any bar to learn who this vendor is and why they received this
        much public money
      </p>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 40 }}>
          <XAxis type="number" tickFormatter={fmt} tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={170} />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="value"
            fill="#0f766e"
            radius={[0, 4, 4, 0]}
            className="cursor-pointer hover:opacity-80"
            onClick={(barData) => {
              const row = (barData as { payload?: { fullName: string; value: number } })
                .payload;
              if (row) onBarClick(row.fullName, row.value);
            }}
          />
        </BarChart>
      </ResponsiveContainer>
      <ClickHint />
    </div>
  );
}

type TabType = "agencies" | "categories" | "monthly" | "vendors";

export default function Charts() {
  const [activeTab, setActiveTab] = useState<TabType>("agencies");
  const penny = usePenny();

  const tabs: { key: TabType; label: string }[] = [
    { key: "agencies", label: "By Agency" },
    { key: "categories", label: "By Type" },
    { key: "monthly", label: "Month by Month" },
    { key: "vendors", label: "Top Vendors" },
  ];

  const pctOfTotal = (value: number) =>
    ((value / FISCAL_METADATA.total_spend) * 100).toFixed(1);

  const explainAgency = (name: string, value: number) => {
    penny.explain(
      `The user clicked the "${name}" agency in the spending chart. It received ${fmt(value)} (${pctOfTotal(value)}% of the $29.5B FY2022 total). Explain what this agency does and why its spending level matters, in 2 plain English sentences.`
    );
  };

  const explainCategory = (name: string, value: number) => {
    penny.explain(
      `The user clicked the spending category "${name}" (${fmt(value)}, ${pctOfTotal(value)}% of total). Explain what this category means for everyday people, in 2 plain English sentences.`
    );
  };

  const explainVendor = (name: string, value: number) => {
    penny.explain(
      `The user clicked vendor "${name}" who received ${fmt(value)} (${pctOfTotal(value)}% of state spending). Explain who they are and why the state pays them, in 2 plain English sentences.`
    );
  };

  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    penny.explain(
      `The user just switched to the "${tabs.find((t) => t.key === tab)?.label}" chart tab. ${TAB_ORIENTATION[tab]} Give a one-sentence orientation to help them explore.`
    );
  };

  return (
    <div
      className="bg-white rounded-2xl border border-gray-200 p-6"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-wrap gap-2 mb-2">
        {tabs.map((tab) => (
          <TabButton
            key={tab.key}
            label={tab.label}
            active={activeTab === tab.key}
            onClick={() => switchTab(tab.key)}
          />
        ))}
      </div>
      <p className="text-xs text-gray-400 mb-4">{TAB_HINTS[activeTab]}</p>

      {activeTab === "agencies" && <AgencyChart onBarClick={explainAgency} />}
      {activeTab === "categories" && (
        <CategoryChart onSliceClick={explainCategory} />
      )}
      {activeTab === "monthly" && (
        <MonthlyChart onPennyExplain={(ctx) => penny.explain(ctx)} />
      )}
      {activeTab === "vendors" && <VendorChart onBarClick={explainVendor} />}
    </div>
  );
}
