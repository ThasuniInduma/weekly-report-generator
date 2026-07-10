import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import * as reportsApi from "../../api/reports";
import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/common/StatusBadge";

function formatWeek(weekStart, weekEnd) {
    return `${format(new Date(weekStart), "MMM d")} – ${format(new Date(weekEnd), "MMM d, yyyy")}`;
}

export default function MyReportsPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await reportsApi.listMyReports();
            setReports(data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load reports");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const handleSubmit = async (id) => {
        await reportsApi.submitReport(id);
        load();
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this draft report?")) return;
        await reportsApi.deleteReport(id);
        load();
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>My Reports</h1>
                    <p>Your weekly report history</p>
                </div>
                <Link to="/reports/new" className="btn btn-primary">
                    New Report
                </Link>
            </div>

            {error && <p className="form-error">{error}</p>}

            {loading ? (
                <Loader />
            ) : reports.length === 0 ? (
                <div className="empty-state">
                    You haven't created any reports yet. Click "New Report" to get started.
                </div>
            ) : (
                <div className="report-list">
                    {reports.map((r) => (
                        <div className="card report-card" key={r._id}>
                            <div className="report-card-header">
                                <div>
                                    <h3>{formatWeek(r.weekStart, r.weekEnd)}</h3>
                                    <p>{r.project?.name}</p>
                                </div>
                                <div className="report-card-actions">
                                    <StatusBadge status={r.status} />
                                    {r.status === "draft" && (
                                        <>
                                            <Link to={`/reports/${r._id}/edit`} className="btn btn-ghost btn-sm">
                                                Edit
                                            </Link>
                                            <button
                                                type="button"
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleSubmit(r._id)}
                                            >
                                                Submit
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(r._id)}
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="field-row">
                                <span className="field-label">Tasks completed</span>
                                <span>{r.tasksCompleted}</span>
                            </div>
                            <div className="field-row">
                                <span className="field-label">Tasks planned for next week</span>
                                <span>{r.tasksPlanned}</span>
                            </div>
                            {r.blockers && (
                                <div className="field-row">
                                    <span className="field-label">Blockers</span>
                                    <span>{r.blockers}</span>
                                </div>
                            )}
                            {r.hoursWorked != null && (
                                <div className="field-row">
                                    <span className="field-label">Hours worked</span>
                                    <span>{r.hoursWorked}</span>
                                </div>
                            )}
                            {r.notes && (
                                <div className="field-row">
                                    <span className="field-label">Notes</span>
                                    <span>{r.notes}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
