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

const TOTAL_BUDGET = FISCAL_METADATA.total_spend;

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

function formatTooltipBillions(value: number): string {
  return `$${(value / 1e9).toFixed(1)}B`;
}

function CustomTooltip({
  active,
  payload,
  label,
  totalBudget,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  totalBudget?: number;
}) {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const pct = totalBudget
      ? ((value / totalBudget) * 100).toFixed(1)
      : null;

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg max-w-48">
        <p className="text-sm font-semibold text-gray-800 mb-1">{label}</p>
        <p className="text-lg font-bold text-blue-600">
          {formatTooltipBillions(value)}
        </p>
        {pct && (
          <p className="text-xs text-gray-500 mt-1">
            {pct}% of total state budget
          </p>
        )}
        <p className="text-xs text-blue-500 mt-2 font-medium">
          Click to get Penny&apos;s explanation →
        </p>
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
          <Tooltip
            content={<CustomTooltip totalBudget={TOTAL_BUDGET} />}
          />
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
  onPennyExplain,
}: {
  onPennyExplain?: (context: string) => void;
}) {
  const data = Object.entries(CATEGORY_TOTALS).map(([name, value]) => ({
    name,
    value,
    displayName: name.length > 30 ? name.slice(0, 30) + "…" : name,
  }));

  const total = data.reduce((sum, d) => sum + d.value, 0);

  const categoryColors = [
    "#1d4ed8",
    "#0f766e",
    "#b45309",
    "#7c3aed",
    "#be185d",
    "#065f46",
    "#92400e",
    "#1e40af",
    "#6d28d9",
  ];

  const handleClick = (entry: { name: string; value: number }) => {
    if (entry?.name && onPennyExplain) {
      const amount = entry.value;
      const pct = ((amount / total) * 100).toFixed(1);
      onPennyExplain(
        `The user clicked on the "${entry.name}" category in the spending breakdown pie chart. This category received $${(amount / 1e9).toFixed(1)}B which is ${pct}% of the total state budget. Explain in 2 plain conversational sentences what this category means and why it matters. No bullet points or dashes. Write as flowing sentences only.`
      );
    }
  };

  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">
        79% of all spending is Grants, Benefits and Client Services — direct
        payments to people and service providers.
      </p>
      <p className="text-xs text-blue-500 mb-4 font-medium">
        💡 Click any slice to understand what this category means
      </p>

      <div className="flex flex-col md:flex-row items-start gap-6">
        <div className="flex-shrink-0">
          <ResponsiveContainer width={280} height={280}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={50}
                onClick={(_, index) => {
                  const entry = data[index];
                  if (entry) handleClick(entry);
                }}
                cursor="pointer"
                label={false}
                labelLine={false}
              >
                {data.map((_, index) => (
                  <Cell
                    key={index}
                    fill={categoryColors[index % categoryColors.length]}
                    stroke="white"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => {
                  const n = Number(value);
                  return [
                    `$${(n / 1e9).toFixed(1)}B (${((n / total) * 100).toFixed(1)}%)`,
                    String(name),
                  ];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-2 flex-1 pt-2">
          {data.map((d, i) => (
            <div
              key={d.name}
              role="button"
              tabIndex={0}
              className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-lg p-1.5 transition-all"
              onClick={() => handleClick(d)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleClick(d);
              }}
            >
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ background: categoryColors[i % categoryColors.length] }}
              />
              <span className="text-xs text-gray-600 flex-1">{d.displayName}</span>
              <span className="text-xs font-semibold text-gray-800 ml-auto whitespace-nowrap">
                ${(d.value / 1e9).toFixed(1)}B
              </span>
              <span className="text-xs text-gray-400 w-10 text-right">
                {((d.value / total) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const MONTH_CONTEXT: Record<string, string> = {
  Jul: "July is the first month of Washington's fiscal year. Spending is typically high because annual grants, contracts and benefit payments are issued at the start of the fiscal year.",
  Aug: "August is typically a quieter month as the initial burst of fiscal year payments settles down.",
  Sep: "September often sees a second spike as quarterly payments and grant disbursements go out.",
  Oct: "October is mid-fall and typically a steady spending month with regular ongoing payments.",
  Nov: "November is one of the lower spending months, with regular ongoing payments but fewer large disbursements.",
  Dec: "December sees high spending as agencies rush to use remaining budget allocations before year end reviews.",
  Jan: "January marks the mid-point of the fiscal year with steady ongoing payments.",
  Feb: "February is typically steady with regular benefit and vendor payments continuing.",
  Mar: "March sees consistent spending as the fiscal year approaches its final quarter.",
  Apr: "April is in the final quarter of the fiscal year with agencies managing remaining budgets.",
  May: "May is near fiscal year end and agencies are finalizing annual spending.",
  Jun: "June is the final month of the fiscal year. Spending may include final contract payments and year-end disbursements.",
};

function MonthlyChart({
  onPennyExplain,
}: {
  onPennyExplain?: (context: string) => void;
}) {
  const data = Object.entries(MONTHLY_SPEND).map(([month, value]) => ({
    month,
    value,
  }));

  const total = Object.values(MONTHLY_SPEND).reduce((a, b) => a + b, 0);
  const average = total / 12;

  const handleClick = (chartState: { activeLabel?: string | number }) => {
    if (chartState?.activeLabel == null || !onPennyExplain) return;

    const month = String(chartState.activeLabel);
    const monthData = MONTHLY_SPEND[month as keyof typeof MONTHLY_SPEND];

    if (!monthData) return;

    const amount = monthData;
    const amountFormatted = `$${(amount / 1e9).toFixed(1)}B`;
    const avgFormatted = `$${(average / 1e9).toFixed(1)}B`;
    const aboveBelow = amount > average ? "above" : "below";
    const diffPct = Math.abs(((amount - average) / average) * 100).toFixed(0);
    const context = MONTH_CONTEXT[month] || "";

    onPennyExplain(
      `The user clicked on ${month} in the monthly spending chart. ${month} had total spending of ${amountFormatted}. The monthly average across FY2022 is ${avgFormatted}, so ${month} is ${diffPct}% ${aboveBelow} average. ${context} Explain specifically why ${month} had ${amountFormatted} in spending in 2 plain conversational sentences. Reference the actual amount and whether it was above or below average. No bullet points, no dashes, write as flowing sentences only.`
    );
  };

  const CustomDot = (props: {
    cx?: number;
    cy?: number;
    payload?: { month: string; value: number };
  }) => {
    const { cx, cy } = props;
    if (cx == null || cy == null) return null;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="#1d4ed8"
        stroke="white"
        strokeWidth={2}
        style={{ cursor: "pointer" }}
      />
    );
  };

  const CustomActiveDot = (props: { cx?: number; cy?: number }) => {
    const { cx, cy } = props;
    if (cx == null || cy == null) return null;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={9}
        fill="#1d4ed8"
        stroke="white"
        strokeWidth={3}
        style={{ cursor: "pointer" }}
      />
    );
  };

  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">
        Spending peaks in July ($3.4B) and September ($3.2B) — the start of
        the fiscal year when annual grants and contracts are issued.
      </p>
      <p className="text-xs text-blue-500 mb-4 font-medium">
        💡 Click any data point to understand why spending was high or low that
        month
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ left: 10, right: 20, top: 10, bottom: 10 }}
          onClick={handleClick}
          style={{ cursor: "pointer" }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis
            tickFormatter={(v) => `$${(v / 1e9).toFixed(1)}B`}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const value = payload[0].value as number;
                const pct = ((value / total) * 100).toFixed(1);
                const aboveBelow = value > average ? "above" : "below";
                const diffPct = Math.abs(
                  ((value - average) / average) * 100
                ).toFixed(0);
                return (
                  <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg">
                    <p className="text-sm font-bold text-gray-800">{label}</p>
                    <p className="text-lg font-bold text-blue-600">
                      ${(value / 1e9).toFixed(1)}B
                    </p>
                    <p className="text-xs text-gray-500">
                      {pct}% of annual budget
                    </p>
                    <p className="text-xs text-gray-500">
                      {diffPct}% {aboveBelow} monthly average
                    </p>
                    <p className="text-xs text-blue-500 mt-1 font-medium">
                      Click to get Penny&apos;s explanation →
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#1d4ed8"
            strokeWidth={2.5}
            dot={<CustomDot />}
            activeDot={<CustomActiveDot />}
          />
        </LineChart>
      </ResponsiveContainer>
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
          <Tooltip
            content={<CustomTooltip totalBudget={TOTAL_BUDGET} />}
          />
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
      <div className="mb-5 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
            3
          </div>
          <h2 className="text-lg font-bold text-gray-800">
            Explore the data — 4 different lenses
          </h2>
        </div>
        <p className="text-sm text-gray-500 mb-4 ml-9">
          We organized the data into 4 views because different questions need
          different angles. Pick the one that matches what you want to understand:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 ml-9">
          <button
            type="button"
            className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-left cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all"
            onClick={() => setActiveTab("agencies")}
          >
            <p className="text-xs font-bold text-gray-800 mb-1">🏛️ By Agency</p>
            <p className="text-xs text-gray-500">
              &quot;Which government departments spent the most?&quot;
            </p>
          </button>
          <button
            type="button"
            className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-left cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all"
            onClick={() => setActiveTab("categories")}
          >
            <p className="text-xs font-bold text-gray-800 mb-1">📂 By Type</p>
            <p className="text-xs text-gray-500">
              &quot;What was the money actually spent on — grants, salaries,
              buildings?&quot;
            </p>
          </button>
          <button
            type="button"
            className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-left cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all"
            onClick={() => setActiveTab("monthly")}
          >
            <p className="text-xs font-bold text-gray-800 mb-1">📅 Month by Month</p>
            <p className="text-xs text-gray-500">
              &quot;Did spending go up or down throughout the year? When were the
              big spikes?&quot;
            </p>
          </button>
          <button
            type="button"
            className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-left cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all"
            onClick={() => setActiveTab("vendors")}
          >
            <p className="text-xs font-bold text-gray-800 mb-1">🏢 Top Vendors</p>
            <p className="text-xs text-gray-500">
              &quot;Which companies and organizations received the most public
              money?&quot;
            </p>
          </button>
        </div>
      </div>

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
        <CategoryChart onPennyExplain={(ctx) => penny.explain(ctx)} />
      )}
      {activeTab === "monthly" && (
        <MonthlyChart onPennyExplain={(ctx) => penny.explain(ctx)} />
      )}
      {activeTab === "vendors" && <VendorChart onBarClick={explainVendor} />}
    </div>
  );
}
