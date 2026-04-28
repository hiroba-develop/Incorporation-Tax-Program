export default function DisclaimerSection() {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mt-6">
      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
        ⚠️ 免責事項・前提条件
      </h4>
      <ul className="text-xs text-slate-500 space-y-1.5">
        <li>• 本ツールは概算であり、実際の税額は個別の状況により異なります。申告・法人化判断の前に必ず税理士にご相談ください。</li>
        <li>• 社会保険料は協会けんぽ（東京・2025年度）の料率を使用しています。健保：9.91%（労使合計）、厚年：18.3%（労使合計）。</li>
        <li>• 法人税は中小企業の軽減税率を適用しています（〜800万円：26.6%、超過分：36.2%）。</li>
        <li>• 法人留保については全額を配当として受け取ることを前提としており、実際の配当政策・タイミングにより結果は異なります。</li>
        <li>• 消費税は簡易課税方式で計算しています（原則課税は対象外）。</li>
        <li>• 個人の手取りには小規模企業共済・iDeCoの積立分を含みます（将来受取の資産として計上）。</li>
        <li>• 個人事業税は一律5%で計算しています（業種別の差異は未対応）。</li>
        <li>• 国民年金は2025年度の固定額（21.012万円/年）を使用しています。</li>
      </ul>
      <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap gap-4 text-xs text-slate-400">
        <span>対象年度：2025年度税制</span>
        <span>バージョン：v1.0</span>
        <span>作成：2026年4月</span>
      </div>
    </div>
  );
}
