import { useAuth } from "@/auth";
import { LoginForm } from "./login";
import InteractiveCanvas from "../InteractiveCanvas";
import { useTaskStoreInitializer } from "@/hooks/useTaskStoreInitializer";
import { useUserStoreInitializer } from "@/hooks/useUserStoreInitializer";

export default function Home() {
  const { user, isLoading } = useAuth();

  // This hook initializes the store and sets up the RxDB subscription.
  useTaskStoreInitializer();
  useUserStoreInitializer();

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
