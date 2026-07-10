import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { endOfWeek, format, startOfWeek } from "date-fns";
import * as reportsApi from "../../api/reports";
import * as projectsApi from "../../api/projects";
import Loader from "../../components/common/Loader";

const emptyForm = {
    project: "",
    week: format(new Date(), "yyyy-MM-dd"),
    tasksCompleted: "",
    tasksPlanned: "",
    blockers: "",
    hoursWorked: "",
    notes: "",
};

export default function ReportFormPage() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(isEdit);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        projectsApi.listProjects().then(setProjects).catch(() => setProjects([]));
    }, []);

    useEffect(() => {
        if (!isEdit) return;
        reportsApi
            .getReport(id)
            .then((r) =>
                setForm({
                    project: r.project?._id || r.project,
                    week: format(new Date(r.weekStart), "yyyy-MM-dd"),
                    tasksCompleted: r.tasksCompleted,
                    tasksPlanned: r.tasksPlanned,
                    blockers: r.blockers || "",
                    hoursWorked: r.hoursWorked ?? "",
                    notes: r.notes || "",
                })
            )
            .catch((err) => setError(err.response?.data?.message || "Failed to load report"))
            .finally(() => setLoading(false));
    }, [id, isEdit]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const buildPayload = () => ({
        project: form.project,
        week: form.week,
        tasksCompleted: form.tasksCompleted,
        tasksPlanned: form.tasksPlanned,
        blockers: form.blockers,
        hoursWorked: form.hoursWorked === "" ? undefined : Number(form.hoursWorked),
        notes: form.notes,
    });

    const handleSave = async (status) => {
        setError("");
        setSubmitting(true);
        try {
            if (isEdit) {
                await reportsApi.updateReport(id, buildPayload());
            } else {
                await reportsApi.createReport({ ...buildPayload(), status });
            }
            navigate("/reports");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save report");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loader />;

    const weekStart = startOfWeek(new Date(form.week), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(form.week), { weekStartsOn: 1 });

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>{isEdit ? "Edit Report" : "New Weekly Report"}</h1>
                    <p>Fields are fixed for every team member so reports stay comparable.</p>
                </div>
            </div>

            {error && <p className="form-error">{error}</p>}

            <form
                className="card"
                style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 640 }}
                onSubmit={(e) => e.preventDefault()}
            >
                <div className="form-grid">
                    <label>
                        Project / Category
                        <select
                            name="project"
                            value={form.project}
                            onChange={handleChange}
                            disabled={isEdit}
                            required
                        >
                            <option value="" disabled>
                                Select a project
                            </option>
                            {projects.map((p) => (
                                <option key={p._id} value={p._id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Week
                        <input
                            type="date"
                            name="week"
                            value={form.week}
                            onChange={handleChange}
                            disabled={isEdit}
                            required
                        />
                        <small style={{ color: "var(--text-muted)" }}>
                            {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d, yyyy")}
                        </small>
                    </label>
                </div>

                <label>
                    Tasks completed
                    <textarea
                        name="tasksCompleted"
                        value={form.tasksCompleted}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Tasks planned for next week
                    <textarea name="tasksPlanned" value={form.tasksPlanned} onChange={handleChange} required />
                </label>

                <label>
                    Blockers / challenges
                    <textarea name="blockers" value={form.blockers} onChange={handleChange} />
                </label>

                <div className="form-grid">
                    <label>
                        Hours worked (optional)
                        <input
                            type="number"
                            name="hoursWorked"
                            min="0"
                            max="168"
                            value={form.hoursWorked}
                            onChange={handleChange}
                        />
                    </label>
                    <label>
                        Notes or links (optional)
                        <input type="text" name="notes" value={form.notes} onChange={handleChange} />
                    </label>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        type="button"
                        className="btn btn-ghost"
                        disabled={submitting}
                        onClick={() => handleSave("draft")}
                    >
                        Save as Draft
                    </button>
                    {!isEdit && (
                        <button
                            type="button"
                            className="btn btn-primary"
                            disabled={submitting}
                            onClick={() => handleSave("submitted")}
                        >
                            Save &amp; Submit
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
