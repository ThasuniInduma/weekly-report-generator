import { useCallback, useEffect, useState } from "react";
import * as projectsApi from "../../api/projects";
import Loader from "../../components/common/Loader";

const emptyForm = { name: "", description: "" };

export default function ProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState(emptyForm);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setProjects(await projectsApi.listProjects());
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load projects");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await projectsApi.createProject(form);
            setForm(emptyForm);
            load();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create project");
        }
    };

    const startEdit = (p) => {
        setEditingId(p._id);
        setEditForm({ name: p.name, description: p.description || "" });
    };

    const handleUpdate = async (id) => {
        setError("");
        try {
            await projectsApi.updateProject(id, editForm);
            setEditingId(null);
            load();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update project");
        }
    };

    const toggleActive = async (p) => {
        try {
            await projectsApi.updateProject(p._id, { isActive: !p.isActive });
            load();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update project");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this project? This only works if no reports reference it.")) return;
        setError("");
        try {
            await projectsApi.deleteProject(id);
            load();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete project");
        }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Projects &amp; Categories</h1>
                    <p>Manage the tags team members attach to their weekly reports.</p>
                </div>
            </div>

            {error && <p className="form-error">{error}</p>}

            <form className="card" style={{ marginBottom: 20 }} onSubmit={handleCreate}>
                <h3>Add a project</h3>
                <div className="form-grid" style={{ alignItems: "end" }}>
                    <label>
                        Name
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </label>
                    <label>
                        Description
                        <input
                            type="text"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </label>
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }}>
                    Add Project
                </button>
            </form>

            {loading ? (
                <Loader />
            ) : (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((p) => (
                                <tr key={p._id}>
                                    {editingId === p._id ? (
                                        <>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={editForm.name}
                                                    onChange={(e) =>
                                                        setEditForm({ ...editForm, name: e.target.value })
                                                    }
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={editForm.description}
                                                    onChange={(e) =>
                                                        setEditForm({ ...editForm, description: e.target.value })
                                                    }
                                                />
                                            </td>
                                            <td>{p.isActive ? "Active" : "Inactive"}</td>
                                            <td>
                                                <div style={{ display: "flex", gap: 8 }}>
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => handleUpdate(p._id)}
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => setEditingId(null)}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td>{p.name}</td>
                                            <td>{p.description}</td>
                                            <td>{p.isActive ? "Active" : "Inactive"}</td>
                                            <td>
                                                <div style={{ display: "flex", gap: 8 }}>
                                                    <button
                                                        type="button"
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => startEdit(p)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => toggleActive(p)}
                                                    >
                                                        {p.isActive ? "Deactivate" : "Activate"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleDelete(p._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
