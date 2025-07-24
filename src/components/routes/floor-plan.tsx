import { useAuth } from "@/auth";
import InteractiveCanvas from "../InteractiveCanvas";
import { LoginForm } from "./login";

export default function FloorPlan() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading session...</div>;
  }

  if (user) {
    return <InteractiveCanvas imageUrl="image.png" />;
  }
  return (
    <div className="flex justify-center items-center h-screen">
      <LoginForm />
    </div>
  );
}
