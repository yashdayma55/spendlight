// Spending aggregates — parsed from public/data/Vendor-Payments_2021-23_FY_2022_.csv
// via parseData.ts. Regenerate after CSV changes: npm run generate-data

import parsed from "./spending-data.json";

export const FISCAL_METADATA = parsed.FISCAL_METADATA;
export const AGENCY_TOTALS = parsed.AGENCY_TOTALS;
export const CATEGORY_TOTALS = parsed.CATEGORY_TOTALS;
export const MONTHLY_SPEND = parsed.MONTHLY_SPEND;
export const TOP_VENDORS = parsed.TOP_VENDORS;
export const AGENCY_BY_CATEGORY = parsed.AGENCY_BY_CATEGORY;
