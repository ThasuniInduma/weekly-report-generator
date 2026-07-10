import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <header className="navbar">
            <div className="navbar-brand">Weekly Report Generator</div>
            <nav className="navbar-links">
                {user?.role === "member" && (
                    <NavLink to="/reports" className="nav-link">
                        My Reports
                    </NavLink>
                )}
                {user?.role === "manager" && (
                    <>
                        <NavLink to="/dashboard" className="nav-link">
                            Dashboard
                        </NavLink>
                        <NavLink to="/team-reports" className="nav-link">
                            Team Reports
                        </NavLink>
                        <NavLink to="/projects" className="nav-link">
                            Projects
                        </NavLink>
                    </>
                )}
            </nav>
            <div className="navbar-user">
                <span className="navbar-user-name">
                    {user?.name} <span className="navbar-user-role">({user?.role})</span>
                </span>
                <button type="button" className="btn btn-ghost" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </header>
    );
}
