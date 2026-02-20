import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getPostLoginPath } from "../../services/authApi";
import { canViewModule } from "../../utils/permissions";

export function PublicRoute({ children }) {
  const { user, isSubscribed } = useAuth();

  if (!user) return children;

  return (
    <Navigate
      to={getPostLoginPath({
        role: user.role,
        is_subscribed: isSubscribed,
      })}
      replace
    />
  );
}

export function ProtectedRoute({ children }) {
  const { user, isSubscribed } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "owner" && !isSubscribed)
    return <Navigate to="/subscription" replace />;

  return children;
}

export function SubscriptionRoute({ children }) {
  const { user, isSubscribed } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "member" || isSubscribed)
    return <Navigate to="/dashboard" replace />;

  return children;
}

export function PermissionRoute({ children, moduleKey }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "owner") return children;

  if (!canViewModule(user, moduleKey)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
