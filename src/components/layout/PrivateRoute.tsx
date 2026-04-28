import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait for session restore before deciding
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--dfl-bg)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={28}
            className="animate-spin"
            style={{ color: "var(--dfl-accent-bright)" }}
          />
          <p className="text-sm" style={{ color: "var(--dfl-text-subtle)" }}>
            Загрузка...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate to="/auth/login" state={{ from: location }} replace />
    );
  }

  return <>{children}</>;
}
