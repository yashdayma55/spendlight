import { existsSync, writeFileSync } from "fs";
import path from "path";
import { parseSpendingCsv } from "../src/lib/parseData";

const csvPath = path.join(
  process.cwd(),
  "public/data/Vendor-Payments_2021-23_FY_2022_.csv"
);
const jsonPath = path.join(process.cwd(), "src/lib/spending-data.json");

if (!existsSync(csvPath)) {
  if (existsSync(jsonPath)) {
    console.log("CSV not found — using existing spending-data.json");
    process.exit(0);
  }
  console.error(
    `Missing ${csvPath}. See public/data/README.md.`
  );
  process.exit(1);
}

const data = parseSpendingCsv();
const outPath = path.join(process.cwd(), "src/lib/spending-data.json");

writeFileSync(outPath, JSON.stringify(data, null, 2));

console.log(`Generated ${outPath}`);
console.log(
  `  ${data.FISCAL_METADATA.total_transactions.toLocaleString()} transactions, ` +
    `$${(data.FISCAL_METADATA.total_spend / 1e9).toFixed(2)}B total`
);
