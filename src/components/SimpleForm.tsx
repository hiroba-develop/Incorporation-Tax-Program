import type { SimpleFormInputs, DeemedPurchaseType, LegalForm } from "../types/simulation";
import { BUSINESS_TYPE_LABELS } from "../utils/constants";

interface SimpleFormProps {
  inputs: SimpleFormInputs;
  onChange: (inputs: SimpleFormInputs) => void;
}

const BUSINESS_TYPES: { key: DeemedPurchaseType; label: string; emoji: string }[] = [
  { key: "type1", label: "卸売業", emoji: "🏭" },
  { key: "type2", label: "小売業", emoji: "🛒" },
  { key: "type3", label: "製造・建設業", emoji: "🔧" },
  { key: "type5", label: "サービス・IT・金融", emoji: "💻" },
  { key: "type6", label: "不動産業", emoji: "🏠" },
];

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

const LEGAL_FORM_OPTIONS: { value: LegalForm; label: string; sub: string }[] = [
  { value: "kabushiki", label: "株式会社", sub: "設立費 25万円" },
  { value: "godo", label: "合同会社", sub: "設立費 10万円" },
];

export default function SimpleForm({ inputs, onChange }: SimpleFormProps) {
  const update = (partial: Partial<SimpleFormInputs>) => {
    onChange({ ...inputs, ...partial });
  };

  return (
    <div className="space-y-6">
      {/* 基本情報 */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
          基本情報
        </h3>
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

          {/* 法人形態：1列・2ボタン */}
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
        </div>
      </section>

      {/* 家族・業種・消費税 */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
          家族・業種・消費税
        </h3>
        <div className="space-y-5">
          <InputRow label="ご家族の状況" hint="扶養人数">
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

          <InputRow label="主な仕事の内容">
            <div className="grid grid-cols-2 gap-2">
              {BUSINESS_TYPES.map(({ key, label, emoji }) => (
                <button
                  key={key}
                  onClick={() => update({ businessType: key })}
                  className={`py-2.5 px-3 rounded-lg border text-sm font-medium transition-all text-left ${
                    inputs.businessType === key
                      ? "bg-blue-50 text-blue-700 border-blue-400"
                      : "bg-white text-slate-600 border-slate-300 hover:border-blue-300"
                  }`}
                >
                  <span className="mr-1.5">{emoji}</span>
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              選択中：{BUSINESS_TYPE_LABELS[inputs.businessType]}（みなし仕入率{
                { type1: 90, type2: 80, type3: 70, type5: 50, type6: 40 }[inputs.businessType]
              }%）
            </p>
          </InputRow>

          <InputRow label="消費税区分">
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  update({ taxCategory: inputs.taxCategory === "taxable" ? "exempt" : "taxable" })
                }
                className={`relative inline-flex h-7 w-13 items-center rounded-full transition-colors flex-shrink-0 ${
                  inputs.taxCategory === "taxable" ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                    inputs.taxCategory === "taxable" ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="text-sm font-medium">
                {inputs.taxCategory === "taxable" ? (
                  <span className="text-blue-600">課税事業者（インボイス登録済み）</span>
                ) : (
                  <span className="text-slate-500">免税事業者</span>
                )}
              </span>
            </div>
          </InputRow>
        </div>
      </section>

      {/* 固定値の説明 */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-amber-700 mb-2">かんたんモードの固定値</p>
        <div className="space-y-1 text-xs text-amber-600">
          <p>・青色申告特別控除：65万円（e-Tax）</p>
          <p>・小規模企業共済：84万円（満額）</p>
          <p>・iDeCo（個人）：81万円（満額）</p>
          <p>・年間維持コスト：60万円 ／ 法人iDeCo：0円</p>
        </div>
        <p className="text-xs text-amber-500 mt-2">※ 詳細モードで個別に設定できます</p>
      </div>
    </div>
  );
}
