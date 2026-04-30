import { useState, useMemo } from "react";
import type { SimulationMode, SimpleFormInputs, DetailFormInputs } from "./types/simulation";
import { simulate, calcBreakEven, applySimpleModeDefaults } from "./utils/calculator";
import Header from "./components/Header";
import SimpleForm from "./components/SimpleForm";
import DetailForm from "./components/DetailForm";
import ResultsSection from "./components/ResultsSection";
import BreakEvenChart from "./components/BreakEvenChart";
import PdfExportButton from "./components/PdfExportButton";
import DisclaimerSection from "./components/DisclaimerSection";

const DEFAULT_SIMPLE_INPUTS: SimpleFormInputs = {
  annualRevenue: 1000,
  annualExpenses: 300,
  executiveCompensation: 500,
  legalForm: "kabushiki",
  dependents: 0,
  businessType: "type5",
  taxCategory: "taxable",
};

const DEFAULT_DETAIL_INPUTS: DetailFormInputs = {
  ...DEFAULT_SIMPLE_INPUTS,
  blueTaxDeduction: 65,
  shoukiboAmount: 84,
  shoukiboEnabled: true,
  idecoPersonalAmount: 81,
  idecoPersonalEnabled: true,
  corporateAdditionalExpenses: 0,
  maintenanceCost: 60,
  idecoExecutiveAmount: 0,
  idecoExecutiveEnabled: false,
};

function SectionHeader({
  step,
  title,
  subtitle,
}: {
  step: number;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
        {step}
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-800">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState<SimulationMode>("simple");
  const [simpleInputs, setSimpleInputs] = useState<SimpleFormInputs>(DEFAULT_SIMPLE_INPUTS);
  const [detailInputs, setDetailInputs] = useState<DetailFormInputs>(DEFAULT_DETAIL_INPUTS);

  const handleModeChange = (newMode: SimulationMode) => {
    if (newMode === "detail" && mode === "simple") {
      setDetailInputs({ ...applySimpleModeDefaults(simpleInputs) });
    } else if (newMode === "simple" && mode === "detail") {
      setSimpleInputs({
        annualRevenue: detailInputs.annualRevenue,
        annualExpenses: detailInputs.annualExpenses,
        executiveCompensation: detailInputs.executiveCompensation,
        legalForm: detailInputs.legalForm,
        dependents: detailInputs.dependents,
        businessType: detailInputs.businessType,
        taxCategory: detailInputs.taxCategory,
      });
    }
    setMode(newMode);
  };

  const activeInputs: DetailFormInputs = useMemo(
    () => (mode === "simple" ? applySimpleModeDefaults(simpleInputs) : detailInputs),
    [mode, simpleInputs, detailInputs]
  );

  const simulationResult = useMemo(() => {
    try {
      return simulate(activeInputs);
    } catch {
      return null;
    }
  }, [activeInputs]);

  const breakEvenAnalysis = useMemo(() => {
    try {
      return calcBreakEven(activeInputs);
    } catch {
      return null;
    }
  }, [activeInputs]);

  const hasValidResult = simulationResult !== null;

  return (
    <div className="flex flex-col min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50">
      <Header mode={mode} onModeChange={handleModeChange} />

      {/* デスクトップ: 2ペイン独立スクロール / モバイル: 縦積みページスクロール */}
      <div className="flex-1 flex flex-col lg:overflow-hidden lg:flex-row">

        {/* 左ペイン: 入力フォーム */}
        <div className="
          lg:w-[500px] lg:flex-shrink-0
          lg:overflow-y-auto lg:border-r lg:border-slate-200
          border-b border-slate-200 lg:border-b-0
          overflow-x-hidden
          bg-white
        ">
          {/* モバイル: 通常フロー / デスクトップ: ペイン内スクロール */}
          <div className="p-4 lg:p-6">
            <SectionHeader
              step={1}
              title="条件を入力"
              subtitle={mode === "simple" ? "7項目を入力するだけで試算できます" : "全項目を詳細に設定できます"}
            />
            {mode === "simple" ? (
              <SimpleForm inputs={simpleInputs} onChange={setSimpleInputs} />
            ) : (
              <DetailForm inputs={detailInputs} onChange={setDetailInputs} />
            )}
          </div>
        </div>

        {/* 右ペイン: シミュレーション結果 */}
        <div className="lg:flex-1 lg:overflow-y-auto overflow-x-hidden bg-slate-50">
          <div className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <SectionHeader
                step={2}
                title="シミュレーション結果"
                subtitle="リアルタイムで計算・更新されます"
              />
              {hasValidResult && simulationResult && (
                <PdfExportButton result={simulationResult} inputs={activeInputs} />
              )}
            </div>

            {hasValidResult && simulationResult && breakEvenAnalysis ? (
              <div id="pdf-export-area" className="space-y-5 pb-6">
                <ResultsSection result={simulationResult} />
                <BreakEvenChart analysis={breakEvenAnalysis} inputs={activeInputs} />
                <DisclaimerSection />
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-slate-500 font-medium">左の入力フォームを入力してください</p>
                <p className="text-slate-400 text-sm mt-1">計算結果がリアルタイムで表示されます</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
