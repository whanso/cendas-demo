import InteractiveCanvas from "@/components/InteractiveCanvas";
import { useTaskStoreInitializer } from "@/hooks/useTaskStoreInitializer";
import { useUserStoreInitializer } from "@/hooks/useUserStoreInitializer";

const FLOOR_PLAN_URL = "image.png";

export default function FloorPlan() {
  // This hook initializes the store and sets up the RxDB subscription.
  useTaskStoreInitializer();
  useUserStoreInitializer();

  return (
    <div className="flex-grow">
      <InteractiveCanvas imageUrl={FLOOR_PLAN_URL} />
    </div>
  );
}
