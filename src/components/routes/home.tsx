import { useAuth } from "@/auth";
import { LoginForm } from "./login";
import InteractiveCanvas from "../InteractiveCanvas";

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading session...</div>;
  }

  if (user) {
    return (
      <InteractiveCanvas imageUrl="image.png" />
    );
  }
  return (
    <div className="flex justify-center items-center h-screen">
      <LoginForm />
    </div>
  );
}
