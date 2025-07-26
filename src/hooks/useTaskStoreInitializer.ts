import { useEffect } from "react";
import { useAuth } from "@/auth";
import { useDatabase } from "@/components/DatabaseProvider";
import useTaskStore from "@/stores/taskStore";

/**
 * This hook is responsible for initializing the task store and setting up
 * the RxDB subscription. It ensures that the store is connected to the
 * database and listening for changes. It also handles cleanup.
 */
export function useTaskStoreInitializer() {
  const db = useDatabase();
  const { user } = useAuth();
  const { initialize, cleanup } = useTaskStore.getState();

  useEffect(() => {
    if (db && user) {
      initialize(db, user);
    }
    return () => cleanup();
  }, [db, user, initialize, cleanup]);
}