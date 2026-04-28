import type { SimulationResult } from "../types/simulation";
import { formatMan, formatManSigned } from "../utils/calculator";

interface ResultsSectionProps {
  result: SimulationResult;
}

function TakeHomeCard({
  title,
  takeHome,
  effectiveTaxRate,
  color,
  icon,
}: {
  title: string;
  takeHome: number;
  effectiveTaxRate: number;
  color: "blue" | "green";
  icon: React.ReactNode;
}) {
  const cls = color === "blue"
    ? { bg: "bg-blue-600", light: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" }
    : { bg: "bg-emerald-600", light: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" };

  return (
    <div className={`rounded-xl border ${cls.border} ${cls.light} p-5`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-8 h-8 ${cls.bg} rounded-lg flex items-center justify-center text-white`}>
          {icon}
        </div>
        <span className="text-sm font-semibold text-slate-600">{title}</span>
      </div>
      <div className={`text-3xl font-bold ${cls.text} tabular-nums`}>
        {formatMan(takeHome, 1)}
        <span className="text-base font-normal ml-1">万円</span>
      </div>
      <div className="text-xs text-slate-500 mt-1.5">
        実効税率：<span className="font-semibold">{effectiveTaxRate.toFixed(1)}%</span>
      </div>
    </div>
  );
}

function Row({ label, value, sub = false }: { label: string; value: string; sub?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-1.5 ${sub ? "pl-4 text-xs text-slate-500" : "text-sm text-slate-700"}`}>
      <span>{label}</span>
      <span className="font-mono tabular-nums">{value} 万円</span>
    </div>
  );
}

export default function ResultsSection({ result }: ResultsSectionProps) {
  const { personal, corporate, difference, fiveYearDifference, verdict } = result;

  const verdictConfig = {
    corporate_better: {
      bg: "bg-emerald-50", border: "border-emerald-300",
      icon: "✅", title: "法人化が有利", color: "text-emerald-700",
      desc: "法人化することで手取りが増える可能性が高いです。",
    },
    personal_better: {
      bg: "bg-blue-50", border: "border-blue-300",
      icon: "📊", title: "個人事業主が有利", color: "text-blue-700",
      desc: "現状では個人事業主のままの方が手取りが多くなります。",
    },
    about_equal: {
      bg: "bg-amber-50", border: "border-amber-300",
      icon: "⚖️", title: "ほぼ同等", color: "text-amber-700",
      desc: "個人と法人の手取りはほぼ同等です。他の要素も考慮して検討してください。",
    },
  }[verdict];

  return (
    <div className="space-y-5 animate-fadeIn" id="results-section">
      {/* 判定バナー */}
      <div className={`rounded-xl border-2 ${verdictConfig.border} ${verdictConfig.bg} p-5`}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">{verdictConfig.icon}</span>
          <div className="flex-1">
            <h3 className={`text-lg font-bold ${verdictConfig.color}`}>{verdictConfig.title}</h3>
            <p className="text-sm text-slate-600 mt-0.5">{verdictConfig.desc}</p>
            <div className="flex flex-wrap gap-6 mt-3">
              <div>
                <span className="text-xs text-slate-500">年間差額（法人－個人）</span>
                <div className={`text-xl font-bold ${verdictConfig.color} tabular-nums`}>
                  {formatManSigned(difference)} 万円
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-500">5年累計差額</span>
                <div className={`text-xl font-bold ${verdictConfig.color} tabular-nums`}>
                  {formatManSigned(fiveYearDifference)} 万円
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 手取り比較カード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TakeHomeCard
          title="個人事業主の手取り"
          takeHome={personal.takeHome}
          effectiveTaxRate={personal.effectiveTaxRate}
          color="blue"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />
        <TakeHomeCard
          title="法人化後の手取り"
          takeHome={corporate.corporateSideTakeHome}
          effectiveTaxRate={corporate.effectiveTaxRate}
          color="green"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
      </div>

      {/* 詳細内訳 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 個人事業主 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
            個人事業主 内訳
          </h4>
          <Row label="粗利（売上－経費）" value={formatMan(personal.grossProfit)} />
          <div className="border-t border-slate-200 my-1" />
          <Row label="▼ 所得税（復興税込）" value={formatMan(personal.incomeTax)} sub />
          <Row label="▼ 住民税" value={formatMan(personal.residentTax)} sub />
          <Row label="▼ 個人事業税" value={formatMan(personal.businessTax)} sub />
          <Row label="▼ 国民健康保険料" value={formatMan(personal.healthInsurance)} sub />
          <Row label="▼ 国民年金" value={formatMan(personal.pensionNational)} sub />
          {personal.consumptionTax > 0 && (
            <Row label="▼ 消費税" value={formatMan(personal.consumptionTax)} sub />
          )}
          <div className="border-t border-slate-200 my-1" />
          <div className="flex justify-between items-center py-2 font-bold text-blue-600">
            <span className="text-sm">手取り合計</span>
            <span className="font-mono tabular-nums text-base">{formatMan(personal.takeHome)} 万円</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
            <span>課税所得</span>
            <span className="font-mono">{formatMan(personal.taxableIncome)} 万円</span>
          </div>
        </div>

        {/* 法人化後 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            法人化後 内訳
          </h4>
          <Row label="役員手取り" value={formatMan(corporate.executiveTakeHome)} />
          <Row label="▼ 役員所得税（復興税込）" value={formatMan(corporate.executiveIncomeTax)} sub />
          <Row label="▼ 役員住民税" value={formatMan(corporate.executiveResidentTax)} sub />
          <Row label="▼ 社保（本人負担）" value={formatMan(corporate.socialInsuranceEmployee)} sub />
          <div className="border-t border-slate-200 my-1" />
          <Row label="配当後手取り（留保分）" value={formatMan(corporate.dividendTakeHome)} />
          <Row label="　法人税引後留保" value={formatMan(corporate.retainedAfterTax)} sub />
          <Row label="▼ 配当課税（20.315%）" value={formatMan(corporate.dividendTax)} sub />
          <div className="border-t border-slate-200 my-1" />
          <Row label="▼ 維持コスト合計" value={formatMan(corporate.maintenanceCostTotal)} sub />
          <div className="border-t border-slate-200 my-1" />
          <div className="flex justify-between items-center py-2 font-bold text-emerald-600">
            <span className="text-sm">法人側手取り合計</span>
            <span className="font-mono tabular-nums text-base">{formatMan(corporate.corporateSideTakeHome)} 万円</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-400 space-y-0.5">
            <div className="flex justify-between">
              <span>法人利益（税前）</span>
              <span className="font-mono">{formatMan(corporate.corporateProfit)} 万円</span>
            </div>
            <div className="flex justify-between">
              <span>法人税等（均等割含む）</span>
              <span className="font-mono">{formatMan(corporate.corporateTax + corporate.equalLevyTax)} 万円</span>
            </div>
            <div className="flex justify-between">
              <span>社保合計（労使両方）</span>
              <span className="font-mono">{formatMan(corporate.socialInsuranceTotal)} 万円</span>
            </div>
            {corporate.consumptionTax > 0 && (
              <div className="flex justify-between">
                <span>消費税</span>
                <span className="font-mono">{formatMan(corporate.consumptionTax)} 万円</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
