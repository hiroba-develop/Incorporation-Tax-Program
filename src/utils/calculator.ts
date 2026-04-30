import type {
  DetailFormInputs,
  SimpleFormInputs,
  PersonalResult,
  CorporateResult,
  SimulationResult,
  BreakEvenAnalysis,
  BreakEvenDataPoint,
} from "../types/simulation";
import {
  BASIC_DEDUCTION,
  DEPENDENT_DEDUCTION,
  NATIONAL_PENSION,
  NATIONAL_HEALTH_INSURANCE_MAX,
  CORPORATE_EQUAL_LEVY_TAX,
  HEALTH_INSURANCE_RATE,
  PENSION_RATE,
  MAX_STANDARD_MONTHLY_WAGE,
  DIVIDEND_TAX_RATE,
  SPECIAL_RECOVERY_TAX_MULTIPLIER,
  KABUSHIKI_INCORPORATION_COST,
  GODO_INCORPORATION_COST,
  INCORPORATION_AMORTIZATION_YEARS,
  BUSINESS_TAX_DEDUCTION,
  BUSINESS_TAX_RATE,
  CORP_TAX_THRESHOLD,
  CORP_TAX_RATE_LOW,
  CORP_TAX_RATE_HIGH,
  RESIDENT_TAX_RATE,
  RESIDENT_TAX_FLAT,
  DEEMED_PURCHASE_RATES,
  INCOME_TAX_BRACKETS,
  SIMPLE_MODE_DEFAULTS,
} from "./constants";

/**
 * 所得税計算（累進課税）- 万円単位で入力・出力
 */
function calcIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  const incomeYen = taxableIncome * 10000;

  for (const bracket of INCOME_TAX_BRACKETS) {
    if (taxableIncome <= bracket.limit) {
      return (incomeYen * bracket.rate - bracket.deduction) / 10000;
    }
  }
  return 0;
}

/**
 * 法人税等（万円単位）
 */
function calcCorporateTax(profit: number): number {
  if (profit <= 0) return 0;
  if (profit <= CORP_TAX_THRESHOLD) {
    return profit * CORP_TAX_RATE_LOW;
  }
  return (
    CORP_TAX_THRESHOLD * CORP_TAX_RATE_LOW +
    (profit - CORP_TAX_THRESHOLD) * CORP_TAX_RATE_HIGH
  );
}

/**
 * 国民健康保険料（万円単位）
 */
function calcHealthInsurance(grossProfit: number): number {
  const base = Math.max(0, grossProfit * 10000 - 430000);
  const premium = (base * 0.0928 + 40000) / 10000;
  return Math.min(premium, NATIONAL_HEALTH_INSURANCE_MAX);
}

/**
 * 消費税（簡易課税方式）- 万円単位
 */
function calcConsumptionTax(
  revenue: number,
  deemedPurchaseRate: number,
  isTaxable: boolean
): number {
  if (!isTaxable) return 0;
  return (revenue / 1.1) * 0.1 * (1 - deemedPurchaseRate);
}

/**
 * 給与所得控除（役員報酬、万円単位）
 */
function calcSalaryIncomeDeduction(compensation: number): number {
  if (compensation <= 162.5) return 55;
  if (compensation <= 180) return compensation * 0.4 - 10;
  if (compensation <= 360) return compensation * 0.3 + 8;
  if (compensation <= 660) return compensation * 0.2 + 44;
  if (compensation <= 850) return compensation * 0.1 + 110;
  return 195;
}

/**
 * 個人事業主の計算
 */
function calcPersonal(
  inputs: DetailFormInputs,
  grossProfit: number
): PersonalResult {
  const deemedPurchaseRate = DEEMED_PURCHASE_RATES[inputs.businessType];
  const isTaxable = inputs.taxCategory === "taxable";

  // Step 2: 個人事業税
  const businessTaxBase = Math.max(0, grossProfit - BUSINESS_TAX_DEDUCTION);
  const businessTax = businessTaxBase * BUSINESS_TAX_RATE;

  // Step 3: 国保
  const healthInsurance = calcHealthInsurance(grossProfit);

  // Step 4: 国民年金
  const pensionNational = NATIONAL_PENSION;

  // Step 5: 課税所得
  const shoukibo = inputs.shoukiboEnabled ? inputs.shoukiboAmount : 0;
  const idecoPersonal = inputs.idecoPersonalEnabled
    ? inputs.idecoPersonalAmount
    : 0;

  const totalDeductions =
    inputs.blueTaxDeduction +
    BASIC_DEDUCTION +
    DEPENDENT_DEDUCTION * inputs.dependents +
    shoukibo +
    idecoPersonal +
    healthInsurance / 2 +
    businessTax / 2;

  const taxableIncome = Math.max(0, grossProfit - totalDeductions);

  // Step 6: 所得税
  const incomeTaxBase = calcIncomeTax(taxableIncome);
  const incomeTax = incomeTaxBase * SPECIAL_RECOVERY_TAX_MULTIPLIER;

  // Step 7: 住民税
  const residentTax = taxableIncome * RESIDENT_TAX_RATE + RESIDENT_TAX_FLAT;

  // Step 8: 消費税
  const consumptionTax = calcConsumptionTax(
    inputs.annualRevenue,
    deemedPurchaseRate,
    isTaxable
  );

  // Step 9: 手取り（小規模・iDeCoは積立資産として手取りに含める）
  const takeHome =
    grossProfit -
    incomeTax -
    residentTax -
    businessTax -
    healthInsurance -
    pensionNational -
    consumptionTax;

  // Step 10: 実効税率
  const totalTaxBurden =
    incomeTax +
    residentTax +
    businessTax +
    healthInsurance +
    pensionNational +
    consumptionTax;
  const effectiveTaxRate =
    grossProfit > 0 ? (totalTaxBurden / grossProfit) * 100 : 0;

  return {
    grossProfit,
    businessTax,
    healthInsurance,
    pensionNational,
    totalDeductions,
    taxableIncome,
    incomeTax,
    residentTax,
    consumptionTax,
    takeHome,
    effectiveTaxRate,
    totalTaxBurden,
  };
}

/**
 * 法人化後の計算
 */
function calcCorporate(
  inputs: DetailFormInputs,
  grossProfit: number
): CorporateResult {
  const deemedPurchaseRate = DEEMED_PURCHASE_RATES[inputs.businessType];
  const isTaxable = inputs.taxCategory === "taxable";

  // Step 1: 設立費年割
  const incorporationCost =
    inputs.legalForm === "kabushiki"
      ? KABUSHIKI_INCORPORATION_COST
      : GODO_INCORPORATION_COST;
  const incorporationCostAnnual =
    incorporationCost / INCORPORATION_AMORTIZATION_YEARS;

  // Step 2: 法人利益
  const corporateProfit =
    inputs.annualRevenue -
    inputs.annualExpenses -
    inputs.executiveCompensation -
    inputs.corporateAdditionalExpenses;

  // Step 3: 法人税等
  const corporateTax = calcCorporateTax(Math.max(0, corporateProfit));
  const equalLevyTax = CORPORATE_EQUAL_LEVY_TAX;

  // Step 4: 消費税
  const consumptionTax = calcConsumptionTax(
    inputs.annualRevenue,
    deemedPurchaseRate,
    isTaxable
  );

  // Step 5: 社会保険料
  const stdMonthlyWage = Math.min(
    inputs.executiveCompensation / 12,
    MAX_STANDARD_MONTHLY_WAGE
  );
  const monthlyInsuranceCost =
    stdMonthlyWage * (HEALTH_INSURANCE_RATE / 2 + PENSION_RATE / 2);
  const socialInsuranceEmployee = monthlyInsuranceCost * 12;
  const socialInsuranceCorporate = monthlyInsuranceCost * 12;
  const socialInsuranceTotal = monthlyInsuranceCost * 24;

  // Step 6: 給与所得控除
  const salaryIncomeDeduction = calcSalaryIncomeDeduction(
    inputs.executiveCompensation
  );

  // Step 7: 役員課税所得
  const idecoExecutive = inputs.idecoExecutiveEnabled
    ? inputs.idecoExecutiveAmount
    : 0;
  const executiveTaxableIncome = Math.max(
    0,
    inputs.executiveCompensation -
      salaryIncomeDeduction -
      BASIC_DEDUCTION -
      DEPENDENT_DEDUCTION * inputs.dependents -
      socialInsuranceEmployee -
      idecoExecutive
  );

  // Step 8: 役員所得税・住民税
  const executiveIncomeTaxBase = calcIncomeTax(executiveTaxableIncome);
  const executiveIncomeTax =
    executiveIncomeTaxBase * SPECIAL_RECOVERY_TAX_MULTIPLIER;
  const executiveResidentTax =
    executiveTaxableIncome * RESIDENT_TAX_RATE + RESIDENT_TAX_FLAT;

  // Step 9: 役員手取り
  const executiveTakeHome =
    inputs.executiveCompensation -
    executiveIncomeTax -
    executiveResidentTax -
    socialInsuranceEmployee;

  // Step 10: 法人留保と配当課税
  const retainedAfterTax = Math.max(
    0,
    corporateProfit - corporateTax - equalLevyTax
  );
  const dividendTax = retainedAfterTax * DIVIDEND_TAX_RATE;
  const dividendTakeHome = retainedAfterTax * (1 - DIVIDEND_TAX_RATE);

  // Step 11: 法人側実質手取り
  const maintenanceCostTotal = inputs.maintenanceCost + incorporationCostAnnual;
  const corporateSideTakeHome =
    executiveTakeHome + dividendTakeHome - maintenanceCostTotal;

  // Step 12: 実効税率
  const totalCost =
    corporateTax +
    equalLevyTax +
    executiveIncomeTax +
    executiveResidentTax +
    socialInsuranceTotal +
    consumptionTax +
    dividendTax +
    maintenanceCostTotal;
  const effectiveTaxRate =
    grossProfit > 0 ? (totalCost / grossProfit) * 100 : 0;

  return {
    incorporationCostAnnual,
    maintenanceCostTotal,
    corporateProfit,
    corporateTax,
    equalLevyTax,
    consumptionTax,
    socialInsuranceEmployee,
    socialInsuranceCorporate,
    socialInsuranceTotal,
    salaryIncomeDeduction,
    executiveTaxableIncome,
    executiveIncomeTax,
    executiveResidentTax,
    executiveTakeHome,
    retainedAfterTax,
    dividendTax,
    dividendTakeHome,
    corporateSideTakeHome,
    effectiveTaxRate,
    totalCost,
  };
}

/**
 * SimpleFormInputs を DetailFormInputs に変換（簡易モード固定値を適用）
 */
export function applySimpleModeDefaults(
  simple: SimpleFormInputs
): DetailFormInputs {
  return {
    ...simple,
    blueTaxDeduction: SIMPLE_MODE_DEFAULTS.blueTaxDeduction,
    shoukiboAmount: SIMPLE_MODE_DEFAULTS.shoukiboAmount,
    shoukiboEnabled: true,
    idecoPersonalAmount: SIMPLE_MODE_DEFAULTS.idecoPersonalAmount,
    idecoPersonalEnabled: true,
    corporateAdditionalExpenses: 0,
    maintenanceCost: SIMPLE_MODE_DEFAULTS.maintenanceCost,
    idecoExecutiveAmount: SIMPLE_MODE_DEFAULTS.idecoExecutiveAmount,
    idecoExecutiveEnabled: false,
  };
}

/**
 * メインのシミュレーション計算
 */
export function simulate(inputs: DetailFormInputs): SimulationResult {
  const grossProfit = inputs.annualRevenue - inputs.annualExpenses;

  const personal = calcPersonal(inputs, grossProfit);
  const corporate = calcCorporate(inputs, grossProfit);

  const difference = corporate.corporateSideTakeHome - personal.takeHome;
  const fiveYearDifference = difference * 5;

  let verdict: SimulationResult["verdict"];
  if (difference > 3) {
    verdict = "corporate_better";
  } else if (difference < -3) {
    verdict = "personal_better";
  } else {
    verdict = "about_equal";
  }

  return { personal, corporate, difference, fiveYearDifference, verdict };
}

/**
 * 損益分岐点分析（売上300〜5000万円、200万円刻み）
 */
export function calcBreakEven(inputs: DetailFormInputs): BreakEvenAnalysis {
  const dataPoints: BreakEvenDataPoint[] = [];

  for (let revenue = 300; revenue <= 5000; revenue += 200) {
    const adjustedExpenses = Math.min(inputs.annualExpenses, revenue * 0.9);

    const adjustedInputs: DetailFormInputs = {
      ...inputs,
      annualRevenue: revenue,
      annualExpenses: adjustedExpenses,
      executiveCompensation: Math.min(inputs.executiveCompensation, revenue - adjustedExpenses),
    };

    const grossProfit = revenue - adjustedExpenses;
    const personalResult = calcPersonal(adjustedInputs, grossProfit);
    const corporateResult = calcCorporate(adjustedInputs, grossProfit);

    dataPoints.push({
      revenue,
      personalTakeHome: Math.round(personalResult.takeHome * 10) / 10,
      corporateTakeHome:
        Math.round(corporateResult.corporateSideTakeHome * 10) / 10,
    });
  }

  // 交差点の検出
  let crossoverRevenue: number | null = null;
  for (let i = 0; i < dataPoints.length - 1; i++) {
    const curr = dataPoints[i];
    const next = dataPoints[i + 1];
    if (
      curr.corporateTakeHome <= curr.personalTakeHome &&
      next.corporateTakeHome > next.personalTakeHome
    ) {
      const mid = (curr.revenue + next.revenue) / 2;
      crossoverRevenue = Math.round(mid / 100) * 100;
      break;
    }
  }

  return { dataPoints, crossoverRevenue };
}

/**
 * 数値を万円表示にフォーマット
 */
export function formatMan(value: number, digits = 1): string {
  if (Math.abs(value) < 0.05) return "0";
  return value.toFixed(digits);
}

/**
 * 符号付き万円表示
 */
export function formatManSigned(value: number, digits = 1): string {
  const formatted = Math.abs(value).toFixed(digits);
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
}
