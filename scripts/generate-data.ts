import { writeFileSync } from "fs";
import path from "path";
import { parseSpendingCsv } from "../src/lib/parseData";

const data = parseSpendingCsv();
const outPath = path.join(process.cwd(), "src/lib/spending-data.json");

writeFileSync(outPath, JSON.stringify(data, null, 2));

console.log(`Generated ${outPath}`);
console.log(
  `  ${data.FISCAL_METADATA.total_transactions.toLocaleString()} transactions, ` +
    `$${(data.FISCAL_METADATA.total_spend / 1e9).toFixed(2)}B total`
);
