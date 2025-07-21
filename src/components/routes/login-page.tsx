import { Navigate } from "react-router";
import useAuth from "@/hooks/useAuth";
import { LoginForm } from "../LoginForm";
import CendasLogo from "../icons/CendasLogo";

export default function LoginPage() {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (currentUser) {
    return <Navigate to="/tasks" replace />;
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8 bg-background">
      <CendasLogo />
      <LoginForm />
    </div>
  );
}
