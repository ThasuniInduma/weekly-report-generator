import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "member" });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            const user = await register(form);
            navigate(user.role === "manager" ? "/dashboard" : "/reports", { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            <form className="auth-card" onSubmit={handleSubmit}>
                <h1>Create an account</h1>
                {error && <p className="form-error">{error}</p>}
                <label>
                    Name
                    <input type="text" name="name" value={form.name} onChange={handleChange} required />
                </label>
                <label>
                    Email
                    <input type="email" name="email" value={form.email} onChange={handleChange} required />
                </label>
                <label>
                    Password
                    <input
                        type="password"
                        name="password"
                        minLength={6}
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Role
                    <select name="role" value={form.role} onChange={handleChange}>
                        <option value="member">Team Member</option>
                        <option value="manager">Manager</option>
                    </select>
                </label>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Creating account…" : "Register"}
                </button>
                <p className="auth-switch">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </form>
        </div>
    );
}
