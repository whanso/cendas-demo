import TaskList from "@/components/TaskList";
import { useTaskStoreInitializer } from "@/hooks/useTaskStoreInitializer";
import { useUserStoreInitializer } from "@/hooks/useUserStoreInitializer";

export default function TasksPage() {
  // This hook initializes the store and sets up the RxDB subscription.
  useTaskStoreInitializer();
  useUserStoreInitializer();

  return (
    <div className="flex-grow">
      <TaskList />
    </div>
  );
}
