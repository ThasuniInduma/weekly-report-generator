import { format } from "date-fns";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

export default function TasksTrendChart({ data }) {
    return (
        <div className="chart-card card">
            <h3>Reports submitted per week</h3>
            <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                    <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                    <XAxis
                        dataKey="week"
                        tickFormatter={(v) => format(new Date(v), "MMM d")}
                        stroke="var(--chart-axis)"
                        fontSize={12}
                        tickLine={false}
                    />
                    <YAxis allowDecimals={false} stroke="var(--chart-axis)" fontSize={12} tickLine={false} />
                    <Tooltip
                        labelFormatter={(v) => format(new Date(v), "MMM d, yyyy")}
                        formatter={(value) => [value, "Reports submitted"]}
                        contentStyle={{
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            fontSize: 13,
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="reportsSubmitted"
                        stroke="var(--chart-series-1)"
                        strokeWidth={2}
                        fill="var(--chart-series-1)"
                        fillOpacity={0.15}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
