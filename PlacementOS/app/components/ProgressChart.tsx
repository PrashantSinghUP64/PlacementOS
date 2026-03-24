import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  date: string;
  score: number;
}

interface ProgressChartProps {
  data: DataPoint[];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export default function ProgressChart({ data }: ProgressChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        No data yet — run some analyses to see your progress!
      </div>
    );
  }

  const chartData = data.map((d) => ({
    date: formatDate(d.date),
    score: d.score,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: "#6b7280" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: "#6b7280" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            fontSize: 13,
          }}
          formatter={(value: any) => [`${value}/100`, "Score"]}
        />
        <ReferenceLine
          y={70}
          stroke="#7C3AED"
          strokeDasharray="4 4"
          label={{ value: "Target", position: "right", fontSize: 11, fill: "#7C3AED" }}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="url(#gradient)"
          strokeWidth={3}
          dot={{ fill: "#7C3AED", r: 5, strokeWidth: 2, stroke: "white" }}
          activeDot={{ r: 7, fill: "#7C3AED" }}
        />
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
      </LineChart>
    </ResponsiveContainer>
  );
}
