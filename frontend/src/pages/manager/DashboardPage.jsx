import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import * as dashboardApi from "../../api/dashboard";
import Loader from "../../components/common/Loader";
import StatCard from "../../components/common/StatCard";
import TasksTrendChart from "../../components/charts/TasksTrendChart";
import SubmissionStatusChart from "../../components/charts/SubmissionStatusChart";
import WorkloadChart from "../../components/charts/WorkloadChart";

export default function DashboardPage() {
    const [summary, setSummary] = useState(null);
    const [charts, setCharts] = useState(null);
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        Promise.all([dashboardApi.getSummary(), dashboardApi.getCharts(), dashboardApi.getActivity()])
            .then(([s, c, a]) => {
                setSummary(s);
                setCharts(c);
                setActivity(a);
            })
            .catch((err) => setError(err.response?.data?.message || "Failed to load dashboard"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Loader />;
    if (error) return <p className="form-error">{error}</p>;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Team Dashboard</h1>
                    <p>Current week at a glance.</p>
                </div>
            </div>

            <div className="stat-grid">
                <StatCard label="Reports submitted this week" value={summary.submittedCount} />
                <StatCard label="Submission compliance rate" value={`${summary.complianceRate}%`} />
                <StatCard label="Open blockers this week" value={summary.openBlockers} />
                <StatCard label="Pending team members" value={summary.pendingCount} />
            </div>

            <div className="chart-grid">
                <TasksTrendChart data={charts.tasksCompletedTrend} />
                <SubmissionStatusChart data={charts.submissionStatusByMember} />
                <WorkloadChart data={charts.workloadByProject} />
            </div>

            <div className="card">
                <h3>Recent activity</h3>
                {activity.length === 0 ? (
                    <div className="empty-state">No reports submitted yet.</div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Team member</th>
                                    <th>Project</th>
                                    <th>Submitted</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activity.map((r) => (
                                    <tr key={r._id}>
                                        <td>{r.user?.name}</td>
                                        <td>{r.project?.name}</td>
                                        <td>{formatDistanceToNow(new Date(r.submittedAt), { addSuffix: true })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
