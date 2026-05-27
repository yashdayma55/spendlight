// RAG (Retrieval Augmented Generation) logic
// When a user asks a question, we find the most relevant
// data chunks and pass only those to Claude as context

import {
  FISCAL_METADATA,
  AGENCY_TOTALS,
  CATEGORY_TOTALS,
  MONTHLY_SPEND,
  TOP_VENDORS,
  AGENCY_BY_CATEGORY,
} from "./data";

// ─── STEP 1: Define chunks ───────────────────────────────────────────────────
// Each chunk is a small piece of data with a topic label and text description
// Think of each chunk as one "page" in our library

export interface DataChunk {
  id: string;
  topic: string;
  keywords: string[];
  content: string;
}

function formatMoney(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${(n / 1e3).toFixed(0)}K`;
}

// Build all data chunks from our data layer
export function buildChunks(): DataChunk[] {
  const chunks: DataChunk[] = [];

  // Chunk 1 — Overall summary
  chunks.push({
    id: "overview",
    topic: "overview",
    keywords: ["total", "overall", "budget", "summary", "spend", "fiscal year", "how much", "washington"],
    content: `Washington State spent a total of ${formatMoney(FISCAL_METADATA.total_spend)} in Fiscal Year ${FISCAL_METADATA.fiscal_year}. 
This covered ${FISCAL_METADATA.total_transactions.toLocaleString()} individual payments to ${FISCAL_METADATA.num_vendors.toLocaleString()} vendors across ${FISCAL_METADATA.num_agencies} government agencies.
The biennium is ${FISCAL_METADATA.biennium}.`,
  });

  // Chunk 2 — Agency breakdown
  const agencyLines = Object.entries(AGENCY_TOTALS)
    .map(([agency, amount]) => `${agency}: ${formatMoney(amount)} (${((amount / FISCAL_METADATA.total_spend) * 100).toFixed(1)}% of total)`)
    .join("\n");

  chunks.push({
    id: "agencies",
    topic: "agencies",
    keywords: ["agency", "agencies", "department", "who spent", "which agency", "most money", "health care", "transportation", "corrections", "ecology", "commerce"],
    content: `Agency spending breakdown for FY2022:\n${agencyLines}`,
  });

  // Chunk 3 — Category breakdown
  const categoryLines = Object.entries(CATEGORY_TOTALS)
    .map(([cat, amount]) => `${cat}: ${formatMoney(amount)} (${((amount / FISCAL_METADATA.total_spend) * 100).toFixed(1)}% of total)`)
    .join("\n");

  chunks.push({
    id: "categories",
    topic: "categories",
    keywords: ["category", "type", "grants", "benefits", "goods", "services", "capital", "travel", "contracts", "what was spent on", "breakdown"],
    content: `Spending by category for FY2022:\n${categoryLines}`,
  });

  // Chunk 4 — Monthly breakdown
  const monthlyLines = Object.entries(MONTHLY_SPEND)
    .map(([month, amount]) => `${month}: ${formatMoney(amount)}`)
    .join("\n");

  chunks.push({
    id: "monthly",
    topic: "monthly trends",
    keywords: ["month", "monthly", "when", "trend", "pattern", "july", "august", "september", "october", "november", "december", "january", "february", "march", "april", "may", "june", "seasonal"],
    content: `Monthly spending pattern for FY2022 (fiscal year starts July):\n${monthlyLines}`,
  });

  // Chunk 5 — Vendor breakdown
  const vendorLines = Object.entries(TOP_VENDORS)
    .map(([vendor, amount]) => `${vendor}: ${formatMoney(amount)}`)
    .join("\n");

  chunks.push({
    id: "vendors",
    topic: "vendors",
    keywords: ["vendor", "company", "contractor", "who was paid", "biggest vendor", "molina", "healthcare", "partnerships", "united health", "paid to", "contractor"],
    content: `Top vendors paid by Washington State in FY2022:\n${vendorLines}`,
  });

  // Chunk 6 — Agency by category (cross breakdown)
  const crossLines = Object.entries(AGENCY_BY_CATEGORY)
    .map(([agency, cats]) => {
      const catLines = Object.entries(cats)
        .map(([cat, amt]) => `  - ${cat}: ${formatMoney(amt)}`)
        .join("\n");
      return `${agency}:\n${catLines}`;
    })
    .join("\n\n");

  chunks.push({
    id: "agency_category",
    topic: "agency category breakdown",
    keywords: ["what did", "spend on", "breakdown", "category", "grants", "goods", "travel", "contracts", "health care authority", "social", "transportation", "corrections"],
    content: `How each agency spent their budget by category:\n${crossLines}`,
  });

  return chunks;
}

// ─── STEP 2: Simple keyword similarity ───────────────────────────────────────
// Compare user question to each chunk's keywords
// Returns a score between 0 and 1
// This is our "find the relevant books" step

function similarity(question: string, chunk: DataChunk): number {
  const q = question.toLowerCase();
  const matches = chunk.keywords.filter((kw) => q.includes(kw.toLowerCase()));
  return matches.length / chunk.keywords.length;
}

// ─── STEP 3: Retrieve relevant chunks ────────────────────────────────────────
// Given a user question, find the top N most relevant chunks
// This is what gets passed to Claude as context

export function retrieveRelevantChunks(
  question: string,
  topN: number = 2
): DataChunk[] {
  const chunks = buildChunks();

  // Score each chunk against the question
  const scored = chunks.map((chunk) => ({
    chunk,
    score: similarity(question, chunk),
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Always include overview chunk + top N matches
  const topChunks = scored.slice(0, topN).map((s) => s.chunk);
  const hasOverview = topChunks.some((c) => c.id === "overview");
  if (!hasOverview) {
    topChunks.push(chunks.find((c) => c.id === "overview")!);
  }

  return topChunks;
}

// ─── STEP 4: Build context string ────────────────────────────────────────────
// Format the retrieved chunks into a clean context string
// This is what we inject into the Claude prompt

export function buildContext(question: string): {
  context: string;
  chunksUsed: string[];
} {
  const relevantChunks = retrieveRelevantChunks(question);
  const chunksUsed = relevantChunks.map((c) => c.id);

  const context = relevantChunks
    .map((c) => `[${c.topic.toUpperCase()}]\n${c.content}`)
    .join("\n\n---\n\n");

  return { context, chunksUsed };
}