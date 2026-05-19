import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function PrivateRoute({ children, adminOnly = false }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 40, color: "white" }}>Загрузка...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (adminOnly && profile?.role !== "admin") {
    return <Navigate to="/profile" />;
  }

  return children;
}

export default PrivateRoute;
