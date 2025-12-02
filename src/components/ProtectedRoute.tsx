import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
    const token = localStorage.getItem("adminToken");

    // In a real app, we'd verify the token expiry/validity here or via an API call
    if (!token) {
        return <Navigate to="/auth" replace />;
    }

    return <Outlet />;
};
