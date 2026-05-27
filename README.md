# Spendlight 💡

**AI-powered public spending explorer — helping journalists, city officials, and curious citizens understand $29.5B in Washington State fiscal data through plain English conversations, a cartoon assistant, and smart visualizations.**

**Live Demo:** https://spendlight-two.vercel.app  
**GitHub:** https://github.com/yashdayma55/spendlight  
**Built by:** Yash Dayma  
**Contact:** yashdayma55@gmail.com  
**LinkedIn:** https://www.linkedin.com/in/yashdayma/

---

## The Problem I Set Out to Solve

Most people have no real way to access public spending data even though it directly affects their lives every single day.

A journalist investigating budget priorities has to file a data request and wait weeks. A city councilmember trying to understand where the money went is handed a spreadsheet with 451,000 rows. A curious citizen who wants to know why healthcare costs so much has no idea where to even begin.

The data exists. It is public. It is freely available. But it is locked behind a wall that requires SQL knowledge, Excel expertise, or a dedicated data analyst to get through.

The specific user pain I targeted: a journalist or city councilmember who has real, important questions about public money but has never written a database query in their life and never will.

I chose this direction over building a traditional dashboard because dashboards do not actually solve this problem. They move complexity from a spreadsheet to a screen without removing it. A bar chart labeled "$13.1B" means nothing to someone who does not know what the Health Care Authority does or why it gets 44% of the entire state budget. The insight is not in the number. The insight is in the explanation.

That is the gap Spendlight closes.

---

## What I Built

### Penny — The AI Cartoon Assistant

The most important product decision I made was building Penny.

Penny is a cartoon financial analyst who lives in the bottom right corner of the screen. She automatically introduces herself when the page loads. When you click any chart bar, pie slice, or data point, Penny explains what it means in 2 to 3 plain English sentences with no jargon and no numbers without context.

This completely changes the user experience. Instead of asking non-technical users to interpret charts themselves, Penny does it for them. The chart becomes secondary. Penny's explanation is the actual answer. A journalist who clicks on the Health Care Authority bar does not see "$13.1B" — they hear Penny say "Health Care Authority received $13.1 billion, which is 44 cents of every dollar the state spent. Most of this pays insurance companies like Molina Healthcare to cover low-income residents through Medicaid."

That is the difference between data and understanding.

### RAG — Retrieval Augmented Generation

Rather than sending the entire dataset to Claude on every single question, I split the pre-aggregated spending data into 6 topic chunks:

- **Overview** — total spend, transaction count, and vendor count
- **Agencies** — breakdown of spending by government department
- **Categories** — grants vs goods vs capital outlays vs contracts
- **Monthly trends** — fiscal year spending pattern from July to June
- **Vendors** — top vendors by total payment received
- **Agency by category** — cross breakdown of how each agency spent

When a user asks a question, a keyword similarity function scores each chunk against the question and retrieves the top 2 most relevant chunks plus always the overview. Only those chunks get passed to Claude as context. This means faster responses, lower token costs, and more focused answers that stay grounded in the real data.

The governance log panel shows exactly which chunks were retrieved for every single query so there is full transparency into how the AI arrived at its answer.

### Story Mode — AI Surfaces the Biggest Findings Automatically

One button click triggers Claude to analyze all the data and return the 3 most newsworthy, surprising, or important insights as structured JSON. These appear as colored insight cards with a headline and plain English explanation.

This solves what I think of as the blank page problem. A journalist who lands on this app for the first time does not know what questions to ask. Story Mode gives them immediate value before they have typed a single word.

### Persona Selector

Users identify themselves as Journalist, City Official, Policy Analyst, or Curious Citizen when they first arrive. The starter questions in the chat box adapt to their role so the experience feels relevant and personalized from the very first interaction.

### Four Chart Views with Explanations

The data is organized into four views because different questions need different angles.

- **By Agency** — "which government departments spent the most?"
- **By Type** — "what was the money actually spent on?"
- **Month by Month** — "did spending go up or down throughout the year?"
- **Top Vendors** — "which companies received the most public money?"

Every single bar, slice, and data point across all four charts is clickable and triggers Penny to explain that specific item in context with the real numbers.

### AI Governance Log

Every Claude API call is logged in real time showing the model used, which RAG chunks were retrieved, input and output token counts, response length, and stop reason. This satisfies the enterprise governance requirement directly and demonstrates that I think about production concerns, not just demo concerns.

In a real enterprise B2B product, this log would persist to an audit database with user identity, session IDs, and retention policies so compliance teams can review all AI usage at any time.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Charts | Recharts |
| AI | Claude (`claude-sonnet-4-6` via Anthropic API) |
| Data parsing | PapaParse (build time) |
| Hosting | Vercel |

---

## Architecture Decisions

### Pre-aggregated data at build time

The raw CSV has 451,029 rows. Rather than querying this on every request or connecting to a live database, I parse and aggregate the CSV at build time into summary constants covering agency totals, category totals, monthly spend, and top vendors. This keeps the POC fast and self-contained without needing any database infrastructure.

### Keyword similarity RAG over vector embeddings

For 6 well-defined data chunks, cosine similarity over vector embeddings would be significant engineering overhead with no meaningful accuracy improvement. A keyword matching function scores each chunk against the user question and retrieves the top matches. This approach is faster to build, easier to explain to non-technical stakeholders, fully transparent in the governance log, and equally accurate for this specific data shape.

### Server-side API route for all Claude calls

All AI calls go through a Next.js server-side API route so the Anthropic API key is never exposed to the browser. The route handles RAG retrieval, prompt construction, the Claude API call, governance logging, and response formatting in a single place. This is the correct production pattern for any application using a paid AI API.

### Penny as the primary interaction layer

The most deliberate product decision was making Penny the primary way users interact with the data rather than making them interpret charts themselves. This directly addresses the brief's requirement to design for someone who has never written a query. Every chart interaction triggers an explanation. The data is never left to speak for itself.

---

## What I Explicitly Deferred

- **Vector embeddings** — keyword similarity is sufficient for 6 chunks and adds no infrastructure complexity in a POC
- **Persistent database** — static fiscal year CSV; no database needed for this use case
- **Authentication** — out of scope for a proof of concept
- **Multi-year comparison** — only FY2022 data was provided
- **Persistent governance log storage** — in-memory logging is sufficient to demonstrate the pattern for a POC

---

## What Would Change in Production

The data layer would move from build-time CSV parsing to a PostgreSQL or BigQuery database with a data pipeline that ingests new fiscal year data automatically and supports multi-year comparisons and drill-down to individual transactions.

RAG would move from keyword similarity to proper vector embeddings stored in a vector database like Pinecone or pgvector. This would enable semantic search that handles questions like "wasteful spending" or "unusual payments" that keyword matching cannot handle.

The governance log would persist to an audit database with user identity, session IDs, IP addresses, and retention policies. An admin dashboard would let compliance teams review all AI usage.

Authentication would add role-based access control so journalists get read-only access, agency administrators see only their own data, and auditors can access governance logs.

Rate limiting and caching would protect API costs. Common questions would be cached. Semantic deduplication would reuse cached answers for similar questions.

Penny would gain voice output and session memory so she can connect insights across the conversation, noticing patterns the user has not explicitly asked about yet.

---

## Trade-offs I Made Consciously

**Pre-aggregated data versus live queries.** Embedding pre-computed summary numbers means the app cannot answer ultra-specific questions like "what did a specific vendor receive in a specific month." But it covers 95% of real non-technical user questions, runs with zero latency, and needs no database infrastructure for the POC. This was the right trade-off for a 45-minute proof of concept.

**Keyword RAG versus vector embeddings.** Keyword similarity is less semantically powerful but requires zero infrastructure, is fully explainable, and is accurate enough for 6 well-defined data chunks. The governance log makes the retrieval completely transparent, something that is harder to achieve with black-box vector search.

---

## AI Usage Log

### Interaction 1 — Initial approach decision

I asked Claude to suggest approaches for helping non-technical users explore government spending data. Claude suggested building a standard dashboard with multiple charts as the main interaction pattern. I pushed back on this because a dashboard moves complexity from a spreadsheet to a screen without actually removing it. I redirected toward a conversational approach with Penny as the primary interaction layer. The chart becomes secondary. Penny's explanation is the actual product. This was a deliberate product decision to serve the non-technical persona rather than just an engineering decision.

### Interaction 2 — RAG implementation

I asked Claude to implement RAG for the dataset. Claude initially suggested using vector embeddings and a full vector database like Pinecone. I redirected because for 6 data chunks in a POC this is unnecessary engineering overhead that adds infrastructure complexity with no meaningful accuracy improvement. I asked for keyword similarity instead. This was faster to build, easier to explain to reviewers, and equally accurate for this specific data shape.

### Interaction 3 — System prompt formatting

Claude's initial AI responses used bullet points and dashes throughout the answers. This looks technical and unfriendly for non-technical users who came to the app specifically because they find data tools intimidating. I updated the system prompt to explicitly ban all list formatting and require flowing conversational sentences only. This made Penny's explanations feel genuinely helpful and warm rather than like reading a data report.

---

## What I Would Build Next

- **Multi-year comparison** — FY2022 vs FY2021 and FY2023 side by side
- **Anomaly detection** — flag unusual spending spikes or sudden vendor increases
- **Export to PDF** — shareable reports from Penny explanations and Story Mode insights
- **Penny memory** — connect insights across the session ("You were just looking at Health Care Authority. Molina Healthcare is their biggest vendor…")
- **Natural language filters** — "show me only agencies that spend more than $1 billion" without writing a query

---

## Quick start

```bash
npm install
```

Place the FY2022 vendor payments CSV at `public/data/Vendor-Payments_2021-23_FY_2022_.csv` (or use the committed `src/lib/spending-data.json`).

Create `.env.local`:

```
ANTHROPIC_API_KEY=your_key_here
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

**Built by Yash Dayma**  
yashdayma55@gmail.com  
https://www.linkedin.com/in/yashdayma/  
https://github.com/yashdayma55  
https://spendlight-two.vercel.app
