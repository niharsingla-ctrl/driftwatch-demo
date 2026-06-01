import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  correctnessOverTime,
  responseTimeDist,
  errorsByStep,
} from "@/data";

const axisStyle = { fontSize: 10, fill: "#8b949e" };
const tooltipStyle = {
  contentStyle: {
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: 8,
    fontSize: 11,
    color: "#e6edf3",
  },
  labelStyle: { color: "#8b949e", fontSize: 10 },
  cursor: { fill: "rgba(88,166,255,0.08)" },
};

export function CorrectnessChart() {
  // `gap` fills the red region only where correctness sits below the 99% target.
  const data = correctnessOverTime.map((d) => ({
    ...d,
    gap: Math.min(d.correct, 99),
  }));
  return (
    <Card>
      <CardHeader>
        <CardTitle>Correctness % over time</CardTitle>
        <span className="text-2xs text-muted">
          drops as concurrency peaks (0:34→1:07)
        </span>
      </CardHeader>
      <CardContent className="h-44 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 14, left: -18, bottom: 0 }}
          >
            <defs>
              <linearGradient id="belowTarget" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f85149" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#f85149" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#21262d" vertical={false} />
            <XAxis
              dataKey="t"
              tick={{ ...axisStyle, fontSize: 9 }}
              tickLine={false}
              axisLine={{ stroke: "#30363d" }}
              interval={0}
              minTickGap={0}
            />
            <YAxis
              domain={[85, 100]}
              ticks={[85, 90, 95, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={axisStyle}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              {...tooltipStyle}
              cursor={{ stroke: "#30363d" }}
              formatter={(value: number, name) =>
                name === "Correct %" ? [`${value}%`, name] : [value, name]
              }
            />
            {/* red shading between the line and the 99% target, only below target */}
            <Area
              type="monotone"
              dataKey="gap"
              baseValue={99}
              stroke="none"
              fill="url(#belowTarget)"
              isAnimationActive={false}
              activeDot={false}
              legendType="none"
              name="below target"
            />
            <ReferenceLine
              y={99}
              stroke="#d29922"
              strokeDasharray="5 3"
              strokeWidth={1.5}
              label={{
                value: "target 99%",
                fill: "#d29922",
                fontSize: 9,
                fontWeight: 600,
                position: "insideTopRight",
              }}
            />
            <Line
              type="monotone"
              dataKey="correct"
              name="Correct %"
              stroke="#3fb950"
              strokeWidth={2.25}
              dot={{ r: 2, fill: "#3fb950", strokeWidth: 0 }}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ResponseTimeChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Response time distribution</CardTitle>
        <span className="text-2xs text-muted">long tail above 200u</span>
      </CardHeader>
      <CardContent className="h-44 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={responseTimeDist}
            margin={{ top: 8, right: 12, left: -18, bottom: 0 }}
          >
            <CartesianGrid stroke="#21262d" vertical={false} />
            <XAxis
              dataKey="bucket"
              tick={{ ...axisStyle, fontSize: 8 }}
              tickLine={false}
              axisLine={{ stroke: "#30363d" }}
              interval={0}
              angle={-25}
              textAnchor="end"
              height={34}
            />
            <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={36} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="count" name="Requests" radius={[2, 2, 0, 0]}>
              {responseTimeDist.map((_, i) => (
                <Cell key={i} fill={i >= 5 ? "#d29922" : "#58a6ff"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ErrorsByStepChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Errors by step</CardTitle>
        <span className="text-2xs text-muted">create_order in red</span>
      </CardHeader>
      <CardContent className="h-44 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={errorsByStep}
            margin={{ top: 8, right: 12, left: -18, bottom: 0 }}
          >
            <CartesianGrid stroke="#21262d" vertical={false} />
            <XAxis
              dataKey="step"
              tick={{ ...axisStyle, fontSize: 8 }}
              tickLine={false}
              axisLine={{ stroke: "#30363d" }}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={34}
            />
            <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={36} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="assertion" name="Assertion fail" stackId="a" fill="#f85149" radius={[0, 0, 0, 0]} />
            <Bar dataKey="timeout" name="Timeout" stackId="a" fill="#d29922" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
