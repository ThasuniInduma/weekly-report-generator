import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/common/Loader";

export default function HomeRedirect() {
    const { user, loading } = useAuth();

    if (loading) return <Loader />;
    if (!user) return <Navigate to="/login" replace />;

    return <Navigate to={user.role === "manager" ? "/dashboard" : "/reports"} replace />;
}
