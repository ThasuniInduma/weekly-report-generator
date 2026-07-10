import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import * as reportsApi from "../../api/reports";
import * as usersApi from "../../api/users";
import * as projectsApi from "../../api/projects";
import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/common/StatusBadge";

function formatWeek(weekStart, weekEnd) {
    return `${format(new Date(weekStart), "MMM d")} – ${format(new Date(weekEnd), "MMM d, yyyy")}`;
}

export default function TeamReportsPage() {
    const [members, setMembers] = useState([]);
    const [projects, setProjects] = useState([]);

    const [statusWeek, setStatusWeek] = useState(format(new Date(), "yyyy-MM-dd"));
    const [teamStatus, setTeamStatus] = useState(null);
    const [statusLoading, setStatusLoading] = useState(true);

    const [filters, setFilters] = useState({ member: "", project: "", from: "", to: "", status: "" });
    const [reports, setReports] = useState([]);
    const [reportsLoading, setReportsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        usersApi.listUsers().then((all) => setMembers(all.filter((u) => u.role === "member")));
        projectsApi.listProjects().then(setProjects);
    }, []);

    const loadStatus = useCallback(async () => {
        setStatusLoading(true);
        try {
            const data = await reportsApi.getTeamStatus({ week: statusWeek });
            setTeamStatus(data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load submission status");
        } finally {
            setStatusLoading(false);
        }
    }, [statusWeek]);

    const loadReports = useCallback(async () => {
        setReportsLoading(true);
        try {
            const params = {};
            if (filters.member) params.member = filters.member;
            if (filters.project) params.project = filters.project;
            if (filters.status) params.status = filters.status;
            if (filters.from) params.from = filters.from;
            if (filters.to) params.to = filters.to;
            const data = await reportsApi.listReports(params);
            setReports(data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load reports");
        } finally {
            setReportsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        loadStatus();
    }, [loadStatus]);

    useEffect(() => {
        loadReports();
    }, [loadReports]);

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Team Reports</h1>
                    <p>Submission status and full report history across the team.</p>
                </div>
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="card" style={{ marginBottom: 20 }}>
                <h3>Submission status by week</h3>
                <label style={{ maxWidth: 220, marginBottom: 12 }}>
                    Week
                    <input
                        type="date"
                        value={statusWeek}
                        onChange={(e) => setStatusWeek(e.target.value)}
                    />
                </label>
                {statusLoading ? (
                    <Loader />
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Team member</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teamStatus?.members.map((m) => (
                                    <tr key={m.user.id}>
                                        <td>{m.user.name}</td>
                                        <td>
                                            <StatusBadge status={m.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="card">
                <h3>All reports</h3>
                <div className="filter-bar">
                    <label>
                        Team member
                        <select
                            value={filters.member}
                            onChange={(e) => setFilters({ ...filters, member: e.target.value })}
                        >
                            <option value="">All</option>
                            {members.map((m) => (
                                <option key={m._id} value={m._id}>
                                    {m.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Project
                        <select
                            value={filters.project}
                            onChange={(e) => setFilters({ ...filters, project: e.target.value })}
                        >
                            <option value="">All</option>
                            {projects.map((p) => (
                                <option key={p._id} value={p._id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Status
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option value="">All</option>
                            <option value="submitted">Submitted</option>
                            <option value="draft">Draft</option>
                        </select>
                    </label>
                    <label>
                        From week
                        <input
                            type="date"
                            value={filters.from}
                            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                        />
                    </label>
                    <label>
                        To week
                        <input
                            type="date"
                            value={filters.to}
                            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                        />
                    </label>
                </div>

                {reportsLoading ? (
                    <Loader />
                ) : reports.length === 0 ? (
                    <div className="empty-state">No reports match these filters.</div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Week</th>
                                    <th>Team member</th>
                                    <th>Project</th>
                                    <th>Status</th>
                                    <th>Hours</th>
                                    <th>Blockers</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map((r) => (
                                    <tr key={r._id}>
                                        <td>{formatWeek(r.weekStart, r.weekEnd)}</td>
                                        <td>{r.user?.name}</td>
                                        <td>{r.project?.name}</td>
                                        <td>
                                            <StatusBadge status={r.status} />
                                        </td>
                                        <td>{r.hoursWorked ?? "—"}</td>
                                        <td>{r.blockers || "—"}</td>
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
