import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth";
import { LoginForm } from "./login";

export default function Home() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading session...</div>;
  }

  if (user) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <h1 className="text-2xl">Welcome, {user.username}!</h1>
        <Button onClick={() => logout()}>Logout</Button>
      </div>
    );
  }
  return (
    <div className="flex justify-center items-center h-screen">
      <LoginForm />
    </div>
  );
}
