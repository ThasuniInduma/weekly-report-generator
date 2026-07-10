import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const STATUS_ORDER = ["submitted", "pending", "late"];
const STATUS_META = {
    submitted: { label: "Submitted", color: "var(--chart-good)" },
    pending: { label: "Pending", color: "var(--chart-warning)" },
    late: { label: "Late", color: "var(--chart-critical)" },
};

export default function SubmissionStatusChart({ data }) {
    const counts = STATUS_ORDER.map((status) => ({
        status,
        label: STATUS_META[status].label,
        count: data.filter((d) => d.status === status).length,
    }));

    return (
        <div className="chart-card card">
            <h3>Submission status by team member</h3>
            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={counts} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                    <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                    <XAxis dataKey="label" stroke="var(--chart-axis)" fontSize={12} tickLine={false} />
                    <YAxis allowDecimals={false} stroke="var(--chart-axis)" fontSize={12} tickLine={false} />
                    <Tooltip
                        contentStyle={{
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            fontSize: 13,
                        }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={64}>
                        <LabelList dataKey="count" position="top" fill="var(--text-muted)" fontSize={12} />
                        {counts.map((entry) => (
                            <Cell key={entry.status} fill={STATUS_META[entry.status].color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
