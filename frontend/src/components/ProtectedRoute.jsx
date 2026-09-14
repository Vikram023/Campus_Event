import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Usage: <ProtectedRoute roles={["organizer","admin"]}><CreateEvent/></ProtectedRoute>
// Omit `roles` to just require any logged-in user.
export default function ProtectedRoute({ children, roles }) {
  const { isLoggedIn, role } = useAuth();

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(role)) return <Navigate to="/" replace />;

  return children;
}
