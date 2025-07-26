import { useEffect } from "react";
import { useAuth } from "@/auth";
import { useDatabase } from "@/components/DatabaseProvider";
import useUserStore from "@/stores/userStore";

/**
 * This hook is responsible for initializing the user store when a user is
 * authenticated. It ensures that the store is connected to the database and
 * sets the current user based on the authenticated user's ID. It also handles
 * cleanup on logout or unmount.
 */
export function useUserStoreInitializer() {
  const db = useDatabase();
  const { user } = useAuth();
  const { initialize, cleanup } = useUserStore.getState();

  useEffect(() => {
    if (db && user) {
      initialize(db, user.userId);
    }
    return () => cleanup();
  }, [db, user, initialize, cleanup]);
}
