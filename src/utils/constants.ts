import type { DeemedPurchaseType } from "../types/simulation";

export const BASIC_DEDUCTION = 48;
export const DEPENDENT_DEDUCTION = 38;
export const NATIONAL_PENSION = 21.012;
export const NATIONAL_HEALTH_INSURANCE_MAX = 104;
export const CORPORATE_EQUAL_LEVY_TAX = 7;
export const HEALTH_INSURANCE_RATE = 0.0991;
export const PENSION_RATE = 0.183;
export const MAX_STANDARD_MONTHLY_WAGE = 65;
export const DIVIDEND_TAX_RATE = 0.20315;
export const SPECIAL_RECOVERY_TAX_MULTIPLIER = 1.021;
export const KABUSHIKI_INCORPORATION_COST = 25;
export const GODO_INCORPORATION_COST = 10;
export const INCORPORATION_AMORTIZATION_YEARS = 5;
export const BUSINESS_TAX_DEDUCTION = 290;
export const BUSINESS_TAX_RATE = 0.05;
export const CORP_TAX_THRESHOLD = 800;
export const CORP_TAX_RATE_LOW = 0.266;
export const CORP_TAX_RATE_HIGH = 0.362;
export const RESIDENT_TAX_RATE = 0.10;
export const RESIDENT_TAX_FLAT = 0.5;

export const DEEMED_PURCHASE_RATES: Record<DeemedPurchaseType, number> = {
  type1: 0.9,
  type2: 0.8,
  type3: 0.7,
  type5: 0.5,
  type6: 0.4,
};

export const BUSINESS_TYPE_LABELS: Record<DeemedPurchaseType, string> = {
  type1: "第1種（卸売業）",
  type2: "第2種（小売業）",
  type3: "第3種（製造業・建設業）",
  type5: "第5種（サービス業・IT・金融）",
  type6: "第6種（不動産業）",
};

export const INCOME_TAX_BRACKETS = [
  { limit: 195, rate: 0.05, deduction: 0 },
  { limit: 330, rate: 0.10, deduction: 97500 },
  { limit: 695, rate: 0.20, deduction: 427500 },
  { limit: 900, rate: 0.23, deduction: 636000 },
  { limit: 1800, rate: 0.33, deduction: 1536000 },
  { limit: 4000, rate: 0.40, deduction: 2796000 },
  { limit: Infinity, rate: 0.45, deduction: 4796000 },
];

export const SIMPLE_MODE_DEFAULTS = {
  blueTaxDeduction: 65 as const,
  shoukiboAmount: 84,
  idecoPersonalAmount: 81,
  maintenanceCost: 60,
  idecoExecutiveAmount: 0,
} as const;
