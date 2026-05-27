# Spendlight

**Follow the Money** — an AI-powered web app that helps non-technical users explore Washington State's FY2022 public spending data ($29.5B across 451,029 vendor payments).

Built for the [Golden Analytics](https://goldenanalytics.com) take-home challenge.

## Features

- **Real CSV parsing** — aggregates computed at build time from the official Open Checkbook vendor payments file
- **Interactive charts** — agencies, categories, monthly trends, and top vendors (click any element for an explanation)
- **RAG-powered chat** — keyword retrieval over six data chunks, then Claude answers in plain English
- **Story Mode** — one-click newsworthy insights as JSON cards
- **Penny** — cartoon financial analyst with idle / thinking / talking animations and Claude-generated speech bubbles
- **AI governance log** — every Claude API call logged in-session with tokens, chunks, and timestamps

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Add the data file

Download vendor payments for the **2021–23 biennium** from [Washington State Open Checkbook](https://fiscal.wa.gov/Spending/Checkbook2123) and place the FY2022 CSV at:

```
public/data/Vendor-Payments_2021-23_FY_2022_.csv
```

See [public/data/README.md](public/data/README.md) for details. If you have the biennium `.xlsx`, export the **FY 2022** sheet to CSV with the filename above.

### 3. Configure Claude

Create `.env.local` (not committed):

```
ANTHROPIC_API_KEY=your_key_here
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`npm run dev` and `npm run build` automatically run `npm run generate-data` to parse the CSV into `src/lib/spending-data.json`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (regenerates data first) |
| `npm run build` | Production build |
| `npm run generate-data` | Parse CSV → `spending-data.json` |

## Stack

- Next.js 16 (App Router) · TypeScript · Tailwind CSS
- Recharts · PapaParse · Claude (`claude-sonnet-4-20250514`)

## Project structure

```
src/
  app/api/chat/     # Claude + RAG API route
  components/       # Charts, ChatBox, StoryMode, Penny, GovernanceLog
  lib/
    parseData.ts    # CSV aggregation (Node/fs)
    data.ts         # Re-exports generated JSON for charts + RAG
    rag.ts          # Chunk retrieval
public/data/        # Place CSV here (gitignored)
```

## Deploy on Vercel

The repo includes `src/lib/spending-data.json`, so Vercel can build without the CSV file.

### Option A — Vercel Dashboard (recommended)

1. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
2. Import **`yashdayma55/spendlight`**.
3. Framework preset: **Next.js** (auto-detected). Leave build command as `npm run build`.
4. Under **Environment Variables**, add:
   - `ANTHROPIC_API_KEY` = your Anthropic API key (same value as in `.env.local`)
5. Click **Deploy**.

After deploy, open your production URL and test `/api/test` — it should return `"status": "success"`.

### Option B — Vercel CLI

```bash
npx vercel login
npx vercel link
npx vercel env add ANTHROPIC_API_KEY   # paste key when prompted
npx vercel --prod
```

## License

MIT — data © Washington State Open Checkbook.
