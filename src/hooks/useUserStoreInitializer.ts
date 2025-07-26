import { useEffect } from "react";
import { useDatabase } from "@/components/DatabaseProvider";
import useUserStore from "@/stores/userStore";

/**
 * This hook is responsible for initializing the user store and setting up
 * the RxDB subscription. It ensures that the store is connected to the
 * database and listening for all users. It also handles cleanup.
 */
export function useUserStoreInitializer() {
  const db = useDatabase();
  const { initialize, cleanup } = useUserStore.getState();

  useEffect(() => {
    if (db) {
      initialize(db);
    }
    return () => cleanup();
  }, [db, initialize, cleanup]);
}
