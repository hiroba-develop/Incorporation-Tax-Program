import type {
  DetailFormInputs,
  DeemedPurchaseType,
  LegalForm,
  TaxCategory,
  BlueTaxDeduction,
} from "../types/simulation";

interface DetailFormProps {
  inputs: DetailFormInputs;
  onChange: (inputs: DetailFormInputs) => void;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
      {children}
    </h3>
  );
}

function InputRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
        {hint && <span className="ml-2 text-xs font-normal text-slate-400">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function AmountInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value || ""}
        min={0}
        step="any"
        onChange={(e) => {
          const v = e.target.value === "" ? 0 : Number(e.target.value);
          if (!isNaN(v)) onChange(v);
        }}
        className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-right text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
      />
      <span className="text-sm text-slate-500 whitespace-nowrap">万円</span>
    </div>
  );
}

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-7 w-13 items-center rounded-full transition-colors flex-shrink-0 ${
        enabled ? "bg-blue-600" : "bg-slate-300"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
          enabled ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function ToggleWithAmount({
  enabled,
  amount,
  onToggle,
  onAmountChange,
}: {
  enabled: boolean;
  amount: number;
  onToggle: () => void;
  onAmountChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <Toggle enabled={enabled} onToggle={onToggle} />
      {enabled && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={amount || ""}
            min={0}
            step="any"
            onChange={(e) => {
              const v = e.target.value === "" ? 0 : Number(e.target.value);
              if (!isNaN(v)) onAmountChange(v);
            }}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-right text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <span className="text-sm text-slate-500 whitespace-nowrap">万円</span>
        </div>
      )}
    </div>
  );
}

const LEGAL_FORM_OPTIONS: { value: LegalForm; label: string; sub: string }[] = [
  { value: "kabushiki", label: "株式会社", sub: "設立費 25万円" },
  { value: "godo", label: "合同会社", sub: "設立費 10万円" },
];

const BUSINESS_TYPES: { key: DeemedPurchaseType; label: string; rate: number }[] = [
  { key: "type1", label: "第1種（卸売業）", rate: 90 },
  { key: "type2", label: "第2種（小売業）", rate: 80 },
  { key: "type3", label: "第3種（製造・建設）", rate: 70 },
  { key: "type5", label: "第5種（サービス・IT）", rate: 50 },
  { key: "type6", label: "第6種（不動産）", rate: 40 },
];

export default function DetailForm({ inputs, onChange }: DetailFormProps) {
  const update = (partial: Partial<DetailFormInputs>) => {
    onChange({ ...inputs, ...partial });
  };

  return (
    <div className="space-y-6">
      {/* 基本情報 */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <SectionTitle>基本情報</SectionTitle>
        <div className="space-y-4">
          {/* 売上・経費：横並び */}
          <div className="grid grid-cols-2 gap-3">
            <InputRow label="年間売上" hint="万円">
              <AmountInput
                value={inputs.annualRevenue}
                onChange={(v) => update({ annualRevenue: Math.max(0, v) })}
              />
            </InputRow>
            <InputRow label="年間経費" hint="万円">
              <AmountInput
                value={inputs.annualExpenses}
                onChange={(v) => update({ annualExpenses: Math.max(0, v) })}
              />
            </InputRow>
          </div>

          {/* 役員報酬：1列 */}
          <InputRow label="役員報酬" hint="法人化後に自分に支払う給与">
            <AmountInput
              value={inputs.executiveCompensation}
              onChange={(v) => update({ executiveCompensation: Math.max(0, v) })}
            />
          </InputRow>

          {/* 法人形態：2ボタン横並び */}
          <InputRow label="法人形態">
            <div className="grid grid-cols-2 gap-2">
              {LEGAL_FORM_OPTIONS.map(({ value, label, sub }) => (
                <button
                  key={value}
                  onClick={() => update({ legalForm: value })}
                  className={`py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${
                    inputs.legalForm === value
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-600 border-slate-300 hover:border-blue-400"
                  }`}
                >
                  <div>{label}</div>
                  <div className={`text-xs font-normal mt-0.5 ${inputs.legalForm === value ? "text-blue-100" : "text-slate-400"}`}>
                    {sub}
                  </div>
                </button>
              ))}
            </div>
          </InputRow>

          {/* 扶養人数 */}
          <InputRow label="扶養人数" hint="配偶者含む 0〜3人">
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() => update({ dependents: n })}
                  className={`py-2 rounded-lg border text-sm font-medium transition-all ${
                    inputs.dependents === n
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-600 border-slate-300 hover:border-blue-400"
                  }`}
                >
                  {n === 0 ? "なし" : `${n}人`}
                </button>
              ))}
            </div>
          </InputRow>

          {/* 消費税 */}
          <InputRow label="消費税区分">
            <div className="flex items-center gap-3">
              <Toggle
                enabled={inputs.taxCategory === "taxable"}
                onToggle={() =>
                  update({ taxCategory: inputs.taxCategory === "taxable" ? "exempt" : "taxable" as TaxCategory })
                }
              />
              <span className="text-sm font-medium">
                {inputs.taxCategory === "taxable" ? (
                  <span className="text-blue-600">課税事業者</span>
                ) : (
                  <span className="text-slate-500">免税事業者</span>
                )}
              </span>
            </div>
          </InputRow>
        </div>
      </section>

      {/* 業種 */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <SectionTitle>業種（みなし仕入率）</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {BUSINESS_TYPES.map(({ key, label, rate }) => (
            <button
              key={key}
              onClick={() => update({ businessType: key })}
              className={`py-2.5 px-3 rounded-lg border text-sm font-medium transition-all text-left ${
                inputs.businessType === key
                  ? "bg-blue-50 text-blue-700 border-blue-400"
                  : "bg-white text-slate-600 border-slate-300 hover:border-blue-300"
              }`}
            >
              <div>{label}</div>
              <div className={`text-xs mt-0.5 ${inputs.businessType === key ? "text-blue-500" : "text-slate-400"}`}>
                みなし仕入率 {rate}%
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 個人節税 */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <SectionTitle>個人の節税設定</SectionTitle>
        <div className="space-y-5">
          <InputRow label="青色申告特別控除">
            <div className="grid grid-cols-3 gap-2">
              {([10, 55, 65] as BlueTaxDeduction[]).map((v) => (
                <button
                  key={v}
                  onClick={() => update({ blueTaxDeduction: v })}
                  className={`py-2 rounded-lg border text-sm font-medium transition-all ${
                    inputs.blueTaxDeduction === v
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-600 border-slate-300 hover:border-blue-400"
                  }`}
                >
                  {v}万円
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1.5">65万：e-Tax＋複式簿記 / 55万：複式簿記 / 10万：簡易</p>
          </InputRow>

          <InputRow label="小規模企業共済" hint="上限84万円">
            <ToggleWithAmount
              enabled={inputs.shoukiboEnabled}
              amount={inputs.shoukiboAmount}
              onToggle={() => update({ shoukiboEnabled: !inputs.shoukiboEnabled })}
              onAmountChange={(v) => update({ shoukiboAmount: Math.max(0, v) })}
            />
          </InputRow>

          <InputRow label="iDeCo（個人）" hint="上限81万円">
            <ToggleWithAmount
              enabled={inputs.idecoPersonalEnabled}
              amount={inputs.idecoPersonalAmount}
              onToggle={() => update({ idecoPersonalEnabled: !inputs.idecoPersonalEnabled })}
              onAmountChange={(v) => update({ idecoPersonalAmount: Math.max(0, v) })}
            />
          </InputRow>
        </div>
      </section>

      {/* 法人コスト */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <SectionTitle>法人コスト設定</SectionTitle>
        <div className="space-y-5">
          <InputRow label="法人追加経費" hint="社宅・社用車・生命保険等">
            <AmountInput
              value={inputs.corporateAdditionalExpenses}
              onChange={(v) => update({ corporateAdditionalExpenses: Math.max(0, v) })}
            />
          </InputRow>

          <InputRow label="年間維持コスト" hint="顧問料・登記更新・決算費等">
            <AmountInput
              value={inputs.maintenanceCost}
              onChange={(v) => update({ maintenanceCost: Math.max(0, v) })}
            />
          </InputRow>

          <InputRow label="iDeCo（役員）" hint="上限27万円">
            <ToggleWithAmount
              enabled={inputs.idecoExecutiveEnabled}
              amount={inputs.idecoExecutiveAmount}
              onToggle={() => update({ idecoExecutiveEnabled: !inputs.idecoExecutiveEnabled })}
              onAmountChange={(v) => update({ idecoExecutiveAmount: Math.max(0, v) })}
            />
          </InputRow>
        </div>
      </section>
    </div>
  );
}
