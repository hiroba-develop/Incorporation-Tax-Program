import type { DetailFormInputs, SimulationResult } from "../types/simulation";
import { BUSINESS_TYPE_LABELS } from "../utils/constants";
import { formatMan } from "../utils/calculator";

interface PdfDocumentProps {
  result: SimulationResult;
  inputs: DetailFormInputs;
}

// 全てのスタイルをRGB値で明示的に指定（oklchを使わないためhtml2canvasで安全に描画できる）
const c = {
  blue: "rgb(37, 99, 235)",
  blueLt: "rgb(219, 234, 254)",
  green: "rgb(5, 150, 105)",
  greenLt: "rgb(209, 250, 229)",
  amber: "rgb(180, 83, 9)",
  amberLt: "rgb(254, 243, 199)",
  slate50: "rgb(248, 250, 252)",
  slate100: "rgb(241, 245, 249)",
  slate200: "rgb(226, 232, 240)",
  slate400: "rgb(148, 163, 184)",
  slate500: "rgb(100, 116, 139)",
  slate700: "rgb(51, 65, 85)",
  slate800: "rgb(30, 41, 59)",
  white: "rgb(255, 255, 255)",
};

function Section({ title, color = c.blue, children }: {
  title: string;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        backgroundColor: color,
        color: c.white,
        fontWeight: 700,
        fontSize: 13,
        padding: "6px 12px",
        borderRadius: "4px 4px 0 0",
      }}>
        {title}
      </div>
      <div style={{
        border: `1px solid ${c.slate200}`,
        borderTop: "none",
        borderRadius: "0 0 4px 4px",
        backgroundColor: c.white,
        padding: "12px 14px",
      }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, sub = false, bold = false }: {
  label: string;
  value: string;
  sub?: boolean;
  bold?: boolean;
}) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: sub ? "3px 0 3px 16px" : "5px 0",
      borderBottom: `1px solid ${c.slate100}`,
      color: sub ? c.slate500 : c.slate800,
      fontSize: sub ? 11 : 12,
      fontWeight: bold ? 700 : 400,
    }}>
      <span>{label}</span>
      <span style={{ fontVariantNumeric: "tabular-nums", minWidth: 90, textAlign: "right" }}>{value}</span>
    </div>
  );
}

function InfoGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
      {children}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${c.slate100}`, fontSize: 12 }}>
      <span style={{ color: c.slate500 }}>{label}</span>
      <span style={{ color: c.slate800, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

export default function PdfDocument({ result, inputs }: PdfDocumentProps) {
  const { personal, corporate, difference, fiveYearDifference, verdict } = result;

  const verdictStyle = verdict === "corporate_better"
    ? { bg: c.greenLt, border: c.green, text: c.green, label: "✅ 法人化が有利" }
    : verdict === "personal_better"
    ? { bg: c.blueLt, border: c.blue, text: c.blue, label: "📊 個人事業主が有利" }
    : { bg: c.amberLt, border: c.amber, text: c.amber, label: "⚖️ ほぼ同等" };

  const shoukibo = inputs.shoukiboEnabled ? inputs.shoukiboAmount : 0;
  const idecoPersonal = inputs.idecoPersonalEnabled ? inputs.idecoPersonalAmount : 0;
  const idecoExec = inputs.idecoExecutiveEnabled ? inputs.idecoExecutiveAmount : 0;

  return (
    <div style={{
      width: 794,
      backgroundColor: c.white,
      fontFamily: '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif',
      color: c.slate800,
      padding: "32px 36px",
      boxSizing: "border-box",
    }}>
      {/* ヘッダー */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 24,
        paddingBottom: 16,
        borderBottom: `2px solid ${c.blue}`,
      }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: c.blue }}>法人化シミュレーション結果</div>
          <div style={{ fontSize: 11, color: c.slate500, marginTop: 4 }}>2025年度税制・保険料率対応 v1.0</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 11, color: c.slate500 }}>
          <div>出力日：{new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}</div>
        </div>
      </div>

      {/* 判定結果 */}
      <div style={{
        backgroundColor: verdictStyle.bg,
        border: `2px solid ${verdictStyle.border}`,
        borderRadius: 8,
        padding: "14px 18px",
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: verdictStyle.text, marginBottom: 10 }}>
          {verdictStyle.label}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div style={{ backgroundColor: c.white, borderRadius: 6, padding: "10px 14px" }}>
            <div style={{ fontSize: 10, color: c.slate500, marginBottom: 4 }}>個人事業主の年間手取り</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: c.blue }}>{formatMan(personal.takeHome, 1)}<span style={{ fontSize: 12, fontWeight: 400, marginLeft: 2 }}>万円</span></div>
            <div style={{ fontSize: 10, color: c.slate400, marginTop: 2 }}>実効税率 {personal.effectiveTaxRate.toFixed(1)}%</div>
          </div>
          <div style={{ backgroundColor: c.white, borderRadius: 6, padding: "10px 14px" }}>
            <div style={{ fontSize: 10, color: c.slate500, marginBottom: 4 }}>法人化後の年間手取り</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: c.green }}>{formatMan(corporate.corporateSideTakeHome, 1)}<span style={{ fontSize: 12, fontWeight: 400, marginLeft: 2 }}>万円</span></div>
            <div style={{ fontSize: 10, color: c.slate400, marginTop: 2 }}>実効税率 {corporate.effectiveTaxRate.toFixed(1)}%</div>
          </div>
          <div style={{ backgroundColor: c.white, borderRadius: 6, padding: "10px 14px" }}>
            <div style={{ fontSize: 10, color: c.slate500, marginBottom: 4 }}>年間差額（法人－個人）</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: verdictStyle.text }}>
              {difference >= 0 ? "+" : ""}{formatMan(difference, 1)}<span style={{ fontSize: 12, fontWeight: 400, marginLeft: 2 }}>万円</span>
            </div>
            <div style={{ fontSize: 10, color: c.slate400, marginTop: 2 }}>5年累計 {fiveYearDifference >= 0 ? "+" : ""}{formatMan(fiveYearDifference, 1)}万円</div>
          </div>
        </div>
      </div>

      {/* 入力条件 */}
      <Section title="■ 入力条件">
        <InfoGrid>
          <InfoItem label="年間売上" value={`${inputs.annualRevenue.toLocaleString()} 万円`} />
          <InfoItem label="年間経費" value={`${inputs.annualExpenses.toLocaleString()} 万円`} />
          <InfoItem label="粗利（売上－経費）" value={`${personal.grossProfit.toLocaleString()} 万円`} />
          <InfoItem label="役員報酬" value={`${inputs.executiveCompensation.toLocaleString()} 万円`} />
          <InfoItem label="法人形態" value={inputs.legalForm === "kabushiki" ? "株式会社" : "合同会社"} />
          <InfoItem label="扶養人数" value={inputs.dependents === 0 ? "なし" : `${inputs.dependents}人`} />
          <InfoItem label="業種（みなし仕入率）" value={BUSINESS_TYPE_LABELS[inputs.businessType]} />
          <InfoItem label="消費税区分" value={inputs.taxCategory === "taxable" ? "課税事業者" : "免税事業者"} />
          <InfoItem label="青色申告特別控除" value={`${inputs.blueTaxDeduction} 万円`} />
          <InfoItem label="小規模企業共済" value={shoukibo > 0 ? `${shoukibo} 万円` : "なし"} />
          <InfoItem label="iDeCo（個人）" value={idecoPersonal > 0 ? `${idecoPersonal} 万円` : "なし"} />
          <InfoItem label="法人追加経費" value={`${inputs.corporateAdditionalExpenses} 万円`} />
          <InfoItem label="年間維持コスト" value={`${inputs.maintenanceCost} 万円`} />
          <InfoItem label="iDeCo（役員）" value={idecoExec > 0 ? `${idecoExec} 万円` : "なし"} />
        </InfoGrid>
      </Section>

      {/* 個人事業主 計算明細 */}
      <Section title="■ 個人事業主 計算明細" color={c.blue}>
        <Row label="粗利（売上 − 経費）" value={`${formatMan(personal.grossProfit)} 万円`} bold />
        <div style={{ marginTop: 6, marginBottom: 2, fontSize: 11, color: c.slate500 }}>【税・社保の控除】</div>
        <Row label="所得税（復興特別所得税込）" value={`▼ ${formatMan(personal.incomeTax)} 万円`} sub />
        <Row label="住民税（所得割＋均等割）" value={`▼ ${formatMan(personal.residentTax)} 万円`} sub />
        <Row label="個人事業税（税率5%）" value={`▼ ${formatMan(personal.businessTax)} 万円`} sub />
        <Row label="国民健康保険料" value={`▼ ${formatMan(personal.healthInsurance)} 万円`} sub />
        <Row label="国民年金（2025年度）" value={`▼ ${formatMan(personal.pensionNational)} 万円`} sub />
        {personal.consumptionTax > 0 && (
          <Row label="消費税（簡易課税）" value={`▼ ${formatMan(personal.consumptionTax)} 万円`} sub />
        )}
        <div style={{ marginTop: 6, marginBottom: 2, fontSize: 11, color: c.slate500 }}>【課税所得の計算】</div>
        <Row label="青色申告特別控除" value={`${inputs.blueTaxDeduction} 万円`} sub />
        {shoukibo > 0 && <Row label="小規模企業共済掛金控除" value={`${shoukibo} 万円`} sub />}
        {idecoPersonal > 0 && <Row label="iDeCo（個人）掛金控除" value={`${idecoPersonal} 万円`} sub />}
        <Row label="課税所得" value={`${formatMan(personal.taxableIncome)} 万円`} sub />
        <div style={{ borderTop: `2px solid ${c.blue}`, marginTop: 8, paddingTop: 8 }}>
          <Row label="年間手取り合計" value={`${formatMan(personal.takeHome)} 万円`} bold />
          <Row label="実効税率（総税・社保 ÷ 粗利）" value={`${personal.effectiveTaxRate.toFixed(1)}%`} sub />
        </div>
      </Section>

      {/* 法人化後 計算明細 ← ここでページ区切り */}
      <div data-pdf-pagebreak="true" />
      <br />
      <Section title="■ 法人化後 計算明細" color={c.green}>
        <div style={{ marginBottom: 2, fontSize: 11, color: c.slate500 }}>【法人サイド】</div>
        <Row label="法人利益（売上－経費－役員報酬－追加経費）" value={`${formatMan(corporate.corporateProfit)} 万円`} />
        <Row label="法人税等（実効税率 26.6% / 36.2%）" value={`▼ ${formatMan(corporate.corporateTax)} 万円`} sub />
        <Row label="法人住民税均等割（固定）" value={`▼ ${formatMan(corporate.equalLevyTax)} 万円`} sub />
        {corporate.consumptionTax > 0 && (
          <Row label="消費税（簡易課税）" value={`▼ ${formatMan(corporate.consumptionTax)} 万円`} sub />
        )}
        <Row label="法人税引後留保" value={`${formatMan(corporate.retainedAfterTax)} 万円`} sub />
        <Row label="配当課税（20.315%）" value={`▼ ${formatMan(corporate.dividendTax)} 万円`} sub />
        <Row label="配当後手取り（留保分）" value={`${formatMan(corporate.dividendTakeHome)} 万円`} bold />

        <div style={{ marginTop: 8, marginBottom: 2, fontSize: 11, color: c.slate500 }}>【役員サイド】</div>
        <Row label="役員報酬（税前）" value={`${formatMan(inputs.executiveCompensation)} 万円`} />
        <Row label="給与所得控除" value={`${formatMan(corporate.salaryIncomeDeduction)} 万円`} sub />
        <Row label="社会保険料（本人負担・年）" value={`▼ ${formatMan(corporate.socialInsuranceEmployee)} 万円`} sub />
        <Row label="社会保険料（法人負担・年）" value={`▼ ${formatMan(corporate.socialInsuranceCorporate)} 万円`} sub />
        <Row label="役員課税所得" value={`${formatMan(corporate.executiveTaxableIncome)} 万円`} sub />
        <Row label="役員所得税（復興税込）" value={`▼ ${formatMan(corporate.executiveIncomeTax)} 万円`} sub />
        <Row label="役員住民税" value={`▼ ${formatMan(corporate.executiveResidentTax)} 万円`} sub />
        <Row label="役員手取り" value={`${formatMan(corporate.executiveTakeHome)} 万円`} bold />

        <div style={{ marginTop: 8, marginBottom: 2, fontSize: 11, color: c.slate500 }}>【維持コスト】</div>
        <Row label={`設立費年割（${inputs.legalForm === "kabushiki" ? "株式会社25万" : "合同会社10万"} ÷ 5年）`} value={`▼ ${formatMan(corporate.incorporationCostAnnual)} 万円`} sub />
        <Row label="年間維持コスト（顧問料等）" value={`▼ ${inputs.maintenanceCost} 万円`} sub />

        <div style={{ borderTop: `2px solid ${c.green}`, marginTop: 8, paddingTop: 8 }}>
          <Row label="法人側手取り合計" value={`${formatMan(corporate.corporateSideTakeHome)} 万円`} bold />
          <Row label="実効税率（総コスト ÷ 粗利）" value={`${corporate.effectiveTaxRate.toFixed(1)}%`} sub />
        </div>
      </Section>

      {/* 免責事項 */}
      <div style={{
        backgroundColor: c.slate50,
        border: `1px solid ${c.slate200}`,
        borderRadius: 6,
        padding: "10px 14px",
        fontSize: 10,
        color: c.slate500,
        lineHeight: 1.7,
      }}>
        <div style={{ fontWeight: 700, marginBottom: 4, color: c.slate700 }}>⚠️ 免責事項・前提条件</div>
        <div>・本ツールは概算であり、実際の税額は個別の状況により異なります。申告・法人化判断の前に必ず税理士にご相談ください。</div>
        <div>・社会保険料は協会けんぽ（東京・2025年度）の料率を使用しています。健保：9.91%（労使合計）、厚年：18.3%（労使合計）。</div>
        <div>・法人税は中小企業の軽減税率（〜800万円：26.6%、超過分：36.2%）を適用しています。</div>
        <div>・消費税は簡易課税方式で計算しています（原則課税は対象外）。法人留保は全額配当を前提としています。</div>
      </div>
    </div>
  );
}
