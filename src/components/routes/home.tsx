import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth";
import { LoginForm } from "./login";
import ConstructionPlan2 from "../ConstructionPlan2";
import ConstructionPlanKonva from "../ConstructionPlanKonva";
import useImage from "use-image";
import { Image } from "react-konva";



export default function Home() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading session...</div>;
  }

  if (user) {
    return (
      <main className="flex flex-col h-screen">
        {/* <header className="flex flex-col justify-center items-center gap-4 p-4">
          <h1 className="text-2xl">Welcome, {user.username}!</h1>
          <Button onClick={() => logout()}>Logout</Button>
        </header> */}
        <ConstructionPlanKonva imageUrl="image.png" />
      </main>
    );
  }
  return (
    <div className="flex justify-center items-center h-screen">
      <LoginForm />
    </div>
  );
}
