import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { BreakEvenAnalysis } from "../types/simulation";

interface BreakEvenChartProps {
  analysis: BreakEvenAnalysis;
}

interface TooltipPayload {
  color: string;
  name: string;
  value: number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-bold text-slate-700 mb-2">売上 {label} 万円</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-600">{entry.name}：</span>
          <span className="font-mono font-bold" style={{ color: entry.color }}>
            {entry.value.toFixed(1)} 万円
          </span>
        </div>
      ))}
    </div>
  );
}

export default function BreakEvenChart({ analysis }: BreakEvenChartProps) {
  const { dataPoints, crossoverRevenue } = analysis;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5" id="breakeven-chart">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
        <div>
          <h3 className="font-bold text-slate-700">損益分岐点グラフ</h3>
          <p className="text-xs text-slate-500 mt-0.5">売上別の個人・法人手取り比較（役員報酬比率を固定）</p>
        </div>
        {crossoverRevenue !== null ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-center">
            <p className="text-xs text-amber-600 font-medium">法人化が有利になる売上</p>
            <p className="text-lg font-bold text-amber-700 tabular-nums">
              約 {crossoverRevenue} 万円
            </p>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-center">
            <p className="text-xs text-slate-500">分岐点はグラフ範囲外</p>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={dataPoints}
          margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="revenue"
            tickFormatter={(v) => `${v}`}
            label={{ value: "年間売上（万円）", position: "insideBottom", offset: -2, fontSize: 11, fill: "#94a3b8" }}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
          />
          <YAxis
            tickFormatter={(v) => `${v}`}
            label={{ value: "手取り（万円）", angle: -90, position: "insideLeft", offset: 15, fontSize: 11, fill: "#94a3b8" }}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: "12px", fontSize: "13px" }}
          />
          {crossoverRevenue !== null && (
            <ReferenceLine
              x={crossoverRevenue}
              stroke="#f59e0b"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{ value: `分岐点 ${crossoverRevenue}万`, position: "top", fontSize: 11, fill: "#d97706" }}
            />
          )}
          <Line
            type="monotone"
            dataKey="personalTakeHome"
            name="個人事業主"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="corporateTakeHome"
            name="法人化後"
            stroke="#10b981"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <p className="text-xs text-slate-400 mt-2 text-center">
        ※ 役員報酬は入力時の売上比率を維持して自動調整。経費は入力値を上限として売上に応じて調整。
      </p>
    </div>
  );
}
