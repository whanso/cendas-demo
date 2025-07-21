import { Navigate, Outlet } from "react-router";
import useAuth from "@/hooks/useAuth";
import { useDatabase } from "@/hooks/useDatabase";

export const ProtectedRoute = () => {
  const { currentUser } = useAuth();
  const isLoading = useDatabase((state) => state.isLoading);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading session...
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
