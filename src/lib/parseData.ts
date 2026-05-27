// Parses Washington State FY2022 vendor payments CSV at build time (Node.js only).
// Run `npm run generate-data` after placing/updating the CSV.

import fs from "fs";
import path from "path";
import Papa from "papaparse";

const CSV_FILENAME = "Vendor-Payments_2021-23_FY_2022_.csv";
const MONTH_NAMES = [
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
] as const;

export interface CsvRow {
  Bien: string;
  FY: string;
  FMonth: string;
  Agy: string;
  Agency: string;
  Object: string;
  Category: string;
  Subobj: string;
  SubCategory: string;
  Vendor: string;
  Amount: string;
}

export interface FiscalMetadata {
  fiscal_year: number;
  biennium: string;
  total_spend: number;
  total_transactions: number;
  num_agencies: number;
  num_vendors: number;
}

export interface ParsedSpendingData {
  FISCAL_METADATA: FiscalMetadata;
  AGENCY_TOTALS: Record<string, number>;
  CATEGORY_TOTALS: Record<string, number>;
  MONTHLY_SPEND: Record<string, number>;
  TOP_VENDORS: Record<string, number>;
  AGENCY_BY_CATEGORY: Record<string, Record<string, number>>;
}

function csvPath(): string {
  return path.join(process.cwd(), "public", "data", CSV_FILENAME);
}

function parseAmount(value: string | number): number {
  if (typeof value === "number") return value;
  const cleaned = String(value).replace(/,/g, "").trim();
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function topEntries(
  totals: Record<string, number>,
  limit: number
): Record<string, number> {
  return Object.fromEntries(
    Object.entries(totals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
  );
}

export function parseSpendingCsv(): ParsedSpendingData {
  const filePath = csvPath();

  if (!fs.existsSync(filePath)) {
    throw new Error(
      `CSV not found at ${filePath}. Place ${CSV_FILENAME} in public/data/ ` +
        `(download from fiscal.wa.gov Open Checkbook → 2021-23 biennium).`
    );
  }

  const csvContent = fs.readFileSync(filePath, "utf-8");
  const { data, errors } = Papa.parse<CsvRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  if (errors.length > 0) {
    console.warn(`CSV parse warnings: ${errors.length} row(s)`);
  }

  const agencyTotals: Record<string, number> = {};
  const categoryTotals: Record<string, number> = {};
  const monthlySpend: Record<string, number> = Object.fromEntries(
    MONTH_NAMES.map((m) => [m, 0])
  );
  const vendorTotals: Record<string, number> = {};
  const agencyByCategory: Record<string, Record<string, number>> = {};

  const agencies = new Set<string>();
  const vendors = new Set<string>();
  let totalSpend = 0;
  let biennium = "2021-23";

  for (const row of data) {
    const agency = (row.Agency ?? "").trim();
    const category = (row.Category ?? "").trim();
    const vendor = (row.Vendor ?? "").trim();
    const amount = parseAmount(row.Amount);
    const fMonth = parseInt(String(row.FMonth).trim(), 10);

    if (row.Bien?.trim()) biennium = row.Bien.trim();

    totalSpend += amount;
    if (agency) agencies.add(agency);
    if (vendor) vendors.add(vendor);

    agencyTotals[agency] = (agencyTotals[agency] ?? 0) + amount;
    categoryTotals[category] = (categoryTotals[category] ?? 0) + amount;
    vendorTotals[vendor] = (vendorTotals[vendor] ?? 0) + amount;

    if (fMonth >= 1 && fMonth <= 12) {
      const month = MONTH_NAMES[fMonth - 1];
      monthlySpend[month] += amount;
    }

    if (!agencyByCategory[agency]) agencyByCategory[agency] = {};
    agencyByCategory[agency][category] =
      (agencyByCategory[agency][category] ?? 0) + amount;
  }

  const topAgencyNames = Object.entries(agencyTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name]) => name);

  const agencyByCategoryTop: Record<string, Record<string, number>> = {};
  for (const name of topAgencyNames) {
    agencyByCategoryTop[name] = agencyByCategory[name];
  }

  return {
    FISCAL_METADATA: {
      fiscal_year: 2022,
      biennium,
      total_spend: totalSpend,
      total_transactions: data.length,
      num_agencies: agencies.size,
      num_vendors: vendors.size,
    },
    AGENCY_TOTALS: topEntries(agencyTotals, 20),
    CATEGORY_TOTALS: categoryTotals,
    MONTHLY_SPEND: monthlySpend,
    TOP_VENDORS: topEntries(vendorTotals, 15),
    AGENCY_BY_CATEGORY: agencyByCategoryTop,
  };
}
