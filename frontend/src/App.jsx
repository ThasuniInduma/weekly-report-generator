import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import AppLayout from "./components/layout/AppLayout";
import HomeRedirect from "./pages/HomeRedirect";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import MyReportsPage from "./pages/member/MyReportsPage";
import ReportFormPage from "./pages/member/ReportFormPage";
import DashboardPage from "./pages/manager/DashboardPage";
import TeamReportsPage from "./pages/manager/TeamReportsPage";
import ProjectsPage from "./pages/manager/ProjectsPage";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route element={<ProtectedRoute />}>
                        <Route element={<AppLayout />}>
                            <Route path="/" element={<HomeRedirect />} />

                            <Route element={<RoleRoute role="member" />}>
                                <Route path="/reports" element={<MyReportsPage />} />
                                <Route path="/reports/new" element={<ReportFormPage />} />
                                <Route path="/reports/:id/edit" element={<ReportFormPage />} />
                            </Route>

                            <Route element={<RoleRoute role="manager" />}>
                                <Route path="/dashboard" element={<DashboardPage />} />
                                <Route path="/team-reports" element={<TeamReportsPage />} />
                                <Route path="/projects" element={<ProjectsPage />} />
                            </Route>
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
