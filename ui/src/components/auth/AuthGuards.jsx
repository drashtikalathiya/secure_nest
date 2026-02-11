import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function PublicRoute({ children }) {
  const { user, isSubscribed } = useAuth();

  if (!user) return children;

  return <Navigate to={isSubscribed ? "/dashboard" : "/subscription"} replace />;
}

export function ProtectedRoute({ children }) {
  const { user, isSubscribed } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (!isSubscribed) return <Navigate to="/subscription" replace />;

  return children;
}

export function SubscriptionRoute({ children }) {
  const { user, isSubscribed } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (isSubscribed) return <Navigate to="/dashboard" replace />;

  return children;
}
