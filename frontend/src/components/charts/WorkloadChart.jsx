import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const SERIES_VARS = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `var(--chart-series-${n})`);

export default function WorkloadChart({ data }) {
    return (
        <div className="chart-card card">
            <h3>Workload by project (this week)</h3>
            <ResponsiveContainer width="100%" height={260}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 8, right: 24, left: 12, bottom: 0 }}
                >
                    <CartesianGrid stroke="var(--chart-grid)" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} stroke="var(--chart-axis)" fontSize={12} tickLine={false} />
                    <YAxis
                        type="category"
                        dataKey="project"
                        stroke="var(--chart-axis)"
                        fontSize={12}
                        tickLine={false}
                        width={110}
                    />
                    <Tooltip
                        contentStyle={{
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            fontSize: 13,
                        }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={28}>
                        <LabelList dataKey="count" position="right" fill="var(--text-muted)" fontSize={12} />
                        {data.map((entry, i) => (
                            <Cell key={entry.project} fill={SERIES_VARS[i % SERIES_VARS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
