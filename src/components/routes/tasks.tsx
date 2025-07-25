import { useAuth } from "@/auth";
import TaskList from "@/components/TaskList";
import { LoginForm } from "./login";

export default function TasksPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading session...</div>;
  }

  if (user) {
    return <TaskList />;
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <LoginForm />
    </div>
  );
}
