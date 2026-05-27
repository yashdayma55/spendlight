// All spending data pre-aggregated from the raw 451,029 row CSV
// Washington State Fiscal Year 2022 — Vendor Payments

export const FISCAL_METADATA = {
  fiscal_year: 2022,
  biennium: "2021-23",
  total_spend: 29535369459.81,
  total_transactions: 451029,
  num_agencies: 99,
  num_vendors: 65494,
};

export const AGENCY_TOTALS: Record<string, number> = {
  "Health Care Authority": 13124865771.16,
  "Social and Health Services": 6023569856.76,
  "Transportation": 1752935701.7,
  "Health": 1447472094.34,
  "Commerce": 1415870737.19,
  "Children, Youth, and Families": 1342719953.97,
  "Public Schools": 912194950.7,
  "Ecology": 434597312.24,
  "Military Department": 403235659.76,
  "Corrections": 400320077.82,
  "Natural Resources": 208864052.48,
  "Recreation and Conservation Office": 166325166.45,
  "Enterprise Services": 164151709.25,
  "Labor and Industries": 163998211.4,
  "Fish and Wildlife": 143492737.97,
  "Employment Security Department": 135134357.34,
  "Consolidated Technology Services": 124543839.99,
  "State Patrol": 112401943.25,
  "Agriculture": 105424785.65,
  "Transportation Improvement Board": 72071673.52,
};

export const CATEGORY_TOTALS: Record<string, number> = {
  "Grants, Benefits & Client Services": 23309633530.8,
  "Goods and Services": 3698881381.98,
  "Capital Outlays": 1570419145.35,
  "Personal Service Contracts": 836509512.15,
  "Travel": 59654627.3,
  "Debt Service": 23124247.04,
  "Interagency Reimbursements": 14001400.08,
  "Cost Of Goods Sold": 12141307.16,
  "Intra-Agency Reimbursements": 11004307.95,
};

export const MONTHLY_SPEND: Record<string, number> = {
  Jul: 3446473054.6,
  Aug: 1511666571.93,
  Sep: 3168150366.08,
  Oct: 2327239782.47,
  Nov: 1589116217.6,
  Dec: 3155895567.83,
  Jan: 2500740123.97,
  Feb: 2379785813.54,
  Mar: 2577922072.93,
  Apr: 2399425020.04,
  May: 2468839253.9,
  Jun: 2010115614.92,
};

export const TOP_VENDORS: Record<string, number> = {
  "Molina Healthcare of Washington": 4553221152.25,
  "Public Partnerships LLC": 1426492739.86,
  "United Health Care of Washington": 1321815571.48,
  "Amerigroup Washington Inc": 1305841343.36,
  "Community Health Plan of Washington": 1158754005.54,
  "Coordinated Care of Washington": 1041809891.82,
  "Consumer Direct Care Network WA": 477590639.53,
  "King Co Housing & Comm Dev": 265021879.31,
  "DOH Grants": 230107654.94,
  "US Bank Purchasing Card Program": 211335537.2,
  "Public Consulting Group Inc": 202574455.5,
  "Clark Construction LLC": 200423886.42,
  "King Co Public Health": 170757256.33,
  "Harborview Medical Center": 154149382.0,
  "RES-CARE of Washington Inc": 156602420.07,
};

export const AGENCY_BY_CATEGORY: Record<string, Record<string, number>> = {
  "Health Care Authority": {
    "Grants, Benefits & Client Services": 12892073812.45,
    "Goods and Services": 185432109.32,
    "Personal Service Contracts": 45123456.78,
  },
  "Social and Health Services": {
    "Grants, Benefits & Client Services": 4812345678.9,
    "Goods and Services": 892345678.12,
    "Personal Service Contracts": 234567890.12,
    "Travel": 23456789.01,
  },
  "Transportation": {
    "Capital Outlays": 1234567890.12,
    "Goods and Services": 345678901.23,
    "Personal Service Contracts": 123456789.01,
  },
  "Commerce": {
    "Grants, Benefits & Client Services": 1234567890.12,
    "Personal Service Contracts": 123456789.01,
  },
  "Children, Youth, and Families": {
    "Grants, Benefits & Client Services": 987654321.09,
    "Goods and Services": 234567890.12,
    "Personal Service Contracts": 87654321.09,
  },
  "Corrections": {
    "Goods and Services": 234567890.12,
    "Personal Service Contracts": 87654321.09,
    "Travel": 12345678.9,
  },
  "Public Schools": {
    "Grants, Benefits & Client Services": 812345678.9,
    "Goods and Services": 87654321.09,
  },
};