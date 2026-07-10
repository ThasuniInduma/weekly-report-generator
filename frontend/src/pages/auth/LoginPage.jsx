import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            const user = await login(form.email, form.password);
            const redirectTo = location.state?.from || (user.role === "manager" ? "/dashboard" : "/reports");
            navigate(redirectTo, { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            <form className="auth-card" onSubmit={handleSubmit}>
                <h1>Log in</h1>
                {error && <p className="form-error">{error}</p>}
                <label>
                    Email
                    <input type="email" name="email" value={form.email} onChange={handleChange} required />
                </label>
                <label>
                    Password
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                </label>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Logging in…" : "Log in"}
                </button>
                <p className="auth-switch">
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </form>
        </div>
    );
}
