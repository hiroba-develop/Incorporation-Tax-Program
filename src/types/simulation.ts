export type LegalForm = "kabushiki" | "godo";
export type TaxCategory = "taxable" | "exempt";
export type DeemedPurchaseType = "type1" | "type2" | "type3" | "type5" | "type6";
export type BlueTaxDeduction = 10 | 55 | 65;
export type SimulationMode = "simple" | "detail";

export interface SimpleFormInputs {
  annualRevenue: number;
  annualExpenses: number;
  executiveCompensation: number;
  legalForm: LegalForm;
  dependents: number;
  businessType: DeemedPurchaseType;
  taxCategory: TaxCategory;
}

export interface DetailFormInputs extends SimpleFormInputs {
  blueTaxDeduction: BlueTaxDeduction;
  shoukiboAmount: number;
  shoukiboEnabled: boolean;
  idecoPersonalAmount: number;
  idecoPersonalEnabled: boolean;
  corporateAdditionalExpenses: number;
  maintenanceCost: number;
  idecoExecutiveAmount: number;
  idecoExecutiveEnabled: boolean;
}

export interface PersonalResult {
  grossProfit: number;
  businessTax: number;
  healthInsurance: number;
  pensionNational: number;
  totalDeductions: number;
  taxableIncome: number;
  incomeTax: number;
  residentTax: number;
  consumptionTax: number;
  takeHome: number;
  effectiveTaxRate: number;
  totalTaxBurden: number;
}

export interface CorporateResult {
  incorporationCostAnnual: number;
  maintenanceCostTotal: number;
  corporateProfit: number;
  corporateTax: number;
  equalLevyTax: number;
  consumptionTax: number;
  socialInsuranceEmployee: number;
  socialInsuranceCorporate: number;
  socialInsuranceTotal: number;
  salaryIncomeDeduction: number;
  executiveTaxableIncome: number;
  executiveIncomeTax: number;
  executiveResidentTax: number;
  executiveTakeHome: number;
  retainedAfterTax: number;
  dividendTax: number;
  dividendTakeHome: number;
  corporateSideTakeHome: number;
  effectiveTaxRate: number;
  totalCost: number;
}

export interface SimulationResult {
  personal: PersonalResult;
  corporate: CorporateResult;
  difference: number;
  fiveYearDifference: number;
  verdict: "corporate_better" | "personal_better" | "about_equal";
}

export interface BreakEvenDataPoint {
  revenue: number;
  personalTakeHome: number;
  corporateTakeHome: number;
}

export interface BreakEvenAnalysis {
  dataPoints: BreakEvenDataPoint[];
  crossoverRevenue: number | null;
}
