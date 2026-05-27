# Spendlight

AI-powered public spending explorer that helps journalists, city officials, and curious citizens understand $29.5 billion in Washington State fiscal data through plain English conversations, a cartoon assistant, and smart interactive visualizations.

**Live Demo:** https://spendlight-two.vercel.app  
**GitHub:** https://github.com/yashdayma55/spendlight  
**Built by:** Yash Dayma  
**Contact:** yashdayma55@gmail.com  
**LinkedIn:** https://www.linkedin.com/in/yashdayma/

---

## The Problem I Set Out to Solve

Most people have no real way to access public spending data even though it directly affects their lives every single day. A journalist investigating budget priorities has to file a data request and wait weeks. A city councilmember trying to understand where the money went is handed a spreadsheet with 451,000 rows and told to figure it out. A curious citizen who wants to know why their state spends so much on healthcare has no idea where to even begin.

The data exists. It is public. It is freely available on the Washington State Open Checkbook portal. But it is locked behind a wall that requires SQL knowledge, Excel expertise, or a dedicated data analyst to get through. The people who most need this information are precisely the people who cannot access it.

I chose to target one specific persona for this challenge: a journalist or city councilmember who has real, important questions about public money but has never written a database query in their life and never will. This persona is smart, motivated, and time-constrained. They do not want to learn a tool. They want an answer.

I deliberately chose this over building something for analysts or technical users because that problem is already solved. Tableau, Power BI, and dozens of other tools serve technical users well. Nobody has solved it for the non-technical majority. That is the gap this challenge is asking us to close and that is the gap Spendlight addresses directly.

---

## Why I Rejected the Dashboard Approach

The most obvious solution to this problem is a dashboard with charts. Show the data visually and people will understand it. This is what most people build for this kind of challenge and it is the wrong answer for this specific user.

A dashboard moves complexity from a spreadsheet to a screen. It does not remove the complexity. A bar chart showing "$13.1B" next to "Health Care Authority" means nothing to a journalist who does not know what the Health Care Authority does, why it exists, what Medicaid managed care is, or why 44% of the entire state budget flows through a single agency. The number is visible but the insight is still locked away.

The real problem is not that the data is hard to see. The real problem is that the data is hard to understand. Those are two completely different problems that require two completely different solutions.

This realization shaped every single design decision I made. The question I kept asking was not "how do I show this data?" but "how do I make this data understood by someone who has never looked at a government budget?"

---

## How I Designed the Solution

### Starting with the user journey

Before writing a single line of code I thought about what a journalist actually experiences when they encounter a new dataset. They land on a page with no context. They do not know what questions to ask. They do not know what is interesting or unusual. They do not know where to start. They are intimidated and they will leave within 30 seconds if nothing grabs them.

This told me the app needed three distinct layers of engagement. The first layer is automatic — the app surfaces the most interesting findings without the user having to ask. The second layer is guided — when the user interacts with anything, the app explains what they are looking at in plain English without them having to request an explanation. The third layer is conversational — the user can ask any question they have and get a direct answer.

These three layers became Story Mode, Penny, and the Chat box respectively.

### The persona decision

I structured the entire experience around four user types: journalist, city official, policy analyst, and curious citizen. This was not a cosmetic decision. Each persona has genuinely different questions and different vocabulary.

A journalist asks "what is the biggest story here?" and "are there any unusual patterns?" A city official asks "which department spent the most?" and "how does this compare to what was budgeted?" A policy analyst asks "what is the breakdown between grants and contracts?" and "which categories grew the most?" A curious citizen asks "where does the money actually go?" and "how much goes to healthcare?"

By asking users to identify themselves upfront, the app can surface the most relevant starter questions for their specific role and make the experience feel personal rather than generic from the very first interaction.

### Why Penny exists

Penny is the most important product decision I made and the one I am most proud of. She did not exist in my original plan. She emerged from a critical question I kept asking myself: even if I show a chart and the user clicks on it, what actually happens? In most apps, nothing happens. The tooltip shows the number. The user still does not understand.

I realized that every single data interaction needed an explanation layer. Not an optional explanation. Not a tooltip with a number. A genuine plain English explanation of what that data point means, why it matters, and what context is needed to understand it.

The natural way to deliver this is a conversational character. Penny sits in the bottom right corner and speaks directly to the user whenever they interact with any part of the visualization. She is powered by Claude via the Anthropic API and uses RAG to pull relevant data context before answering so her explanations are always grounded in the real numbers.

The design principle behind Penny is that the chart is secondary and the explanation is the actual product. Most data tools treat the visualization as the product and the explanation as optional documentation. Spendlight inverts this. The visualization exists to give the user something to click on. Penny's explanation is what they actually came for.

---

## How I Decided on the Four Chart Categories

This is the decision I thought about most carefully because getting it wrong would mean the entire visualization layer fails to serve the user.

The raw dataset has 11 columns: biennium, fiscal year, fiscal month, agency code, agency name, object code, category, sub-object code, sub-category, vendor name, and amount. From these 11 columns there are dozens of ways to slice the data. I needed to pick exactly the right four angles that answer the questions a non-technical user actually has.

I started by writing down every question a journalist or councilmember might ask when looking at government spending data. The list had about 20 questions. I then grouped them into themes and found that almost every question fell into one of four fundamental categories.

The first category is accountability by institution. Who is responsible for this spending? Which government body controls which budget? This is the **By Agency** view. When a journalist wants to investigate overspending or a councilmember wants to understand their department's share of the budget, they are asking an agency-level question. The Health Care Authority getting 44% of the entire state budget is the kind of finding that only becomes visible when you look at the data through an agency lens.

The second category is accountability by purpose. What was the money actually used for? Was it direct payments to citizens, purchases of goods and equipment, construction projects, or professional services? This is the **By Type** view. The insight that 79% of all spending is Grants, Benefits and Client Services — meaning direct payments to people rather than government operational costs — fundamentally changes how a reader understands the budget. Without this view, a reader might assume most government spending goes to salaries and buildings when in reality most of it flows directly to citizens and service providers.

The third category is accountability over time. Did spending stay consistent throughout the year or were there unusual spikes? When did the big payments go out? Is there a pattern that suggests how the fiscal calendar works? This is the **Month by Month** view. The insight that July and September are dramatically higher spending months because that is when annual grants and contracts are issued at the start of the fiscal year is the kind of context that transforms raw numbers into a story. Without the temporal view this pattern is invisible.

The fourth category is accountability by recipient. Which organizations actually received this public money? Are there a small number of vendors receiving a disproportionate share? Are the biggest recipients familiar names or unknown entities? This is the **Top Vendors** view. The insight that the top vendor — Molina Healthcare of Washington — received $4.55 billion, which is more than the entire Transportation department budget, is one of the most striking facts in the entire dataset. It only becomes visible when you look at the data through a vendor lens.

These four views are not arbitrary. They map directly to the four fundamental questions any accountability-minded user asks about public spending: who spent it, what was it spent on, when was it spent, and who received it. Together they give a complete picture of the budget from four different angles, each one revealing something the others cannot.

---

## The RAG Architecture and Why I Built It This Way

RAG stands for Retrieval Augmented Generation. The concept is simple: instead of sending an AI model your entire dataset on every question, you first find the most relevant pieces of information and then send only those pieces. This makes answers faster, cheaper, and more accurate because the model is not distracted by irrelevant information.

I built the RAG implementation in three stages.

The first stage was chunking the data. I took the pre-aggregated spending summaries and split them into six logical chunks. The overview chunk contains the top-level numbers: total spend, transaction count, vendor count, and agency count. The agencies chunk contains the full breakdown of spending by government agency with percentages. The categories chunk contains the breakdown by spending type. The monthly chunk contains the month-by-month spending pattern with the fiscal calendar context. The vendors chunk contains the top vendors by total payment. The agency-by-category chunk contains the cross breakdown showing how each major agency allocated its budget across different spending types.

The second stage was building the retrieval function. When a user asks a question, the function scores each of the six chunks against the question using keyword similarity. It counts how many of each chunk's keywords appear in the question and calculates a relevance score. The top two scoring chunks are selected plus the overview chunk is always included regardless of score. This means every answer has the big picture context plus the two most relevant detailed breakdowns.

The third stage was prompt construction. The retrieved chunks are formatted into a clean context block and injected into the Claude system prompt alongside strict formatting instructions. The model is told to answer in plain conversational sentences, never use bullet points or dashes, always provide percentage context alongside dollar amounts, and keep answers to two or three sentences.

I chose keyword similarity over vector embeddings for a deliberate reason. With only six chunks, the additional accuracy of semantic search over keyword matching is negligible. A question about healthcare will always score highest on the agencies chunk and the vendor chunk because those are the chunks with the most healthcare-related keywords. Vector embeddings would give me the same result with significantly more infrastructure complexity. In a production system with hundreds or thousands of chunks covering multiple years and states, vector embeddings would absolutely be the right choice. For six well-defined chunks covering one fiscal year, keyword similarity is the right engineering trade-off.

The governance log in the app shows exactly which chunks were retrieved for every single query. This transparency is important for two reasons. For enterprise customers it provides the audit trail required for compliance. For developers it makes the RAG system debuggable and explainable rather than a black box.

---

## Why Story Mode Is the First Thing Users See

Story Mode exists to solve a specific problem I call the blank page problem. When a non-technical user first encounters a dataset they do not know what to ask. They do not know what is interesting or unusual. They do not have the domain knowledge to know which questions would reveal something meaningful. They are staring at a blank search box with no idea what to type.

Traditional data tools solve this by providing tutorials, documentation, and example queries. These solutions require effort from the user. They require the user to stop, read, learn, and then return to the tool. Most users will not do this. They will leave.

Story Mode inverts this completely. Instead of asking the user to learn how to find the story, it finds the story for them automatically in a single click. Claude analyzes all the key data points and returns the three most newsworthy, surprising, or important findings as structured insight cards. Each card has a short punchy headline and a two-sentence plain English explanation.

The result is that a journalist who has never seen a government budget can arrive at the app, click one button, and within five seconds have three genuinely interesting story leads sitting in front of them. That is the kind of immediate value that makes a non-technical user trust the tool and keep exploring.

I placed Story Mode at the very top of the page before the charts specifically because I want the user's first experience to be receiving value, not being asked to do work. Get the story first. Explore the details second. This ordering respects the user's time and intelligence.

---

## The Technical Architecture in Full

The entire application is built on Next.js 16 with the App Router. TypeScript handles type safety across every file. Tailwind CSS handles all styling without any custom CSS files. Recharts handles all four data visualizations. The Anthropic API provides Claude Sonnet (`claude-sonnet-4-6`) as the AI backbone for all three AI features: Penny's explanations, the chat answers, and Story Mode insights. Papaparse handles CSV parsing at build time. Vercel handles deployment with automatic redeployment on every push to the main branch.

The file structure reflects the separation of concerns clearly. The data layer lives in `src/lib/data.ts` and `src/lib/parseData.ts`. The RAG logic lives in `src/lib/rag.ts`. The API route that handles all Claude calls lives in `src/app/api/chat/route.ts`. Each UI component is isolated: `Charts.tsx`, `ChatBox.tsx`, `StoryMode.tsx`, `GovernanceLog.tsx`, `Penny.tsx`, and `PersonaSelector.tsx`. The main page in `src/app/page.tsx` assembles these components and manages the shared governance log state.

All Claude API calls are made server-side through the API route. The Anthropic API key is stored as an environment variable and is never exposed to the browser. Every call logs a complete governance record covering the timestamp, model used, user message, RAG chunks retrieved, context length, response length, input tokens, output tokens, and stop reason.

---

## What I Explicitly Deferred and Why

- **Vector embeddings** — keyword similarity is sufficient for six chunks and adds no infrastructure complexity in a proof of concept
- **Persistent database** — static fiscal year CSV; no live database needed for this use case
- **Authentication and RBAC** — out of scope for a proof of concept; first addition before production
- **Multi-year comparison** — only FY2022 data was provided in the challenge dataset
- **Persistent governance log storage** — in-memory logging demonstrates the pattern and architectural intent
- **Mobile optimization** — deprioritized in favor of a complete desktop experience

---

## What Would Change Before This Could Ship

The data layer would move from build-time CSV parsing to a PostgreSQL or BigQuery database. A data pipeline would ingest new fiscal year data automatically on a schedule. The app would support multi-year comparisons and drill-down to individual transactions rather than only pre-aggregated summaries.

RAG would move from keyword similarity to proper vector embeddings stored in a vector database like Pinecone or pgvector. This would enable semantic search that handles conceptual questions like "wasteful spending" or "unusual payment patterns" that keyword matching cannot handle.

The governance log would persist to an audit database with user identity, session IDs, IP addresses, and configurable retention policies. An admin dashboard would let compliance and legal teams review all AI interactions at any time for any user.

Authentication would add role-based access control so a journalist gets read-only public data access, an agency administrator sees only their own agency's spending, and an auditor can access the complete governance log across all users and sessions.

Rate limiting and semantic caching would protect API costs at scale. Common questions would be cached and semantically similar questions would reuse existing answers rather than making a new API call.

Penny would gain session memory so she can connect insights across the entire conversation, noticing patterns the user has not explicitly asked about. She would also gain voice output for accessibility.

---

## Trade-offs I Made Consciously

**Pre-aggregated data at build time versus live database queries.** Embedding pre-computed summary numbers means the app cannot answer ultra-specific questions like "what did a specific vendor receive in a specific month" because that granularity is not in the aggregated data layer. The trade-off is correct for a proof of concept because it covers 95% of the questions a non-technical user actually asks, runs with zero query latency, and needs no database infrastructure. In production this becomes a real database with full transaction-level access.

**Keyword RAG versus vector embeddings.** As described in the RAG section above — correct for six well-defined chunks but would need to change at scale.

**One focused persona experience versus serving everyone equally.** I optimized for the journalist and councilmember persona rather than building an equally good experience for data analysts who already have better tools. Trying to serve everyone often means serving nobody well.

---

## AI Usage Log

### Interaction 1 — Rejecting the dashboard approach

I asked Claude to suggest the best approach for helping non-technical users explore government spending data. Claude suggested building a standard dashboard with multiple charts as the primary interaction pattern, which is the obvious and expected answer for this kind of challenge. I pushed back because I had already identified that dashboards do not solve the understanding problem, they only solve the visibility problem. I redirected the entire approach toward a conversational explanation-first design with Penny as the primary interaction layer. This was the most consequential product decision in the project and it came from disagreeing with the first answer the AI gave me.

### Interaction 2 — RAG implementation approach

I asked Claude to implement RAG for the dataset. Claude initially proposed using vector embeddings with a Pinecone vector database, which is the standard production RAG architecture. I redirected because for six data chunks in a proof of concept this adds significant infrastructure complexity with zero accuracy improvement over keyword matching. I asked for keyword similarity instead. The result is a RAG implementation that is simpler to understand, faster to build, fully transparent in the governance log, and equally accurate for this specific data shape.

### Interaction 3 — Fixing AI response formatting

After building the chat feature I tested it and found that Claude's responses were using bullet points and dashes throughout, which made the answers look technical and unfriendly. This directly contradicted the core design principle of making the app feel accessible to non-technical users. I went back into the system prompt and added explicit rules banning all list formatting and requiring flowing conversational sentences. I also added a text cleaning function in the Penny component that strips any remaining markdown formatting from responses before displaying them. The result is that every AI response in the app reads like a knowledgeable friend explaining something clearly rather than a data report.

---

## What I Would Build Next

- **Multi-year comparison** — FY2022 vs FY2021 and FY2023 side by side
- **Anomaly detection** — unusual spikes, sudden vendor increases, unexpected category growth
- **Export to PDF or newsletter** — shareable reports from Penny and Story Mode
- **Penny session memory** — connect insights across the conversation proactively
- **Natural language filters** — "show me only agencies that spend more than one billion dollars"
- **Comparison mode** — two agencies or vendors side by side with Penny explaining the differences

---

**Built by Yash Dayma**  
yashdayma55@gmail.com  
https://www.linkedin.com/in/yashdayma/  
https://github.com/yashdayma55  
https://spendlight-two.vercel.app
