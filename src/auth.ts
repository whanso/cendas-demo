import { useState, useEffect } from "react";
import { getDatabase } from "./database";
import { type CendasDatabase, type UserDocType } from "./types/schemas";
import type { RxState } from "rxdb";

/**
 * Creates or gets the auth state singleton.
 * The state is persisted inside of the RxDB database.
 */
export const getAuthState = async (): Promise<
  RxState<{ user: UserDocType | null }>
> => {
  return (await getDatabase()).authState;
};

/**
 * Logs a user in by setting their data in the auth state.
 */
export const login = async (user: UserDocType) => {
  const authState = await getAuthState();
  await authState.set("user", () => user);
};

/**
 * Logs the user out by clearing their data from the auth state.
 */
export const logout = async () => {
  const authState = await getAuthState();
  await authState.set("user", () => null);
};

/**
 * A React hook to get the current authentication state.
 * It subscribes to the `user$` observable from the RxState.
 */
export const useAuth = () => {
  const [user, setUser] = useState<UserDocType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let sub: any;
    (async () => {
      const authState = await getAuthState();
      sub = authState.user$.subscribe((currentUser) => {
        console.log("new value to authstate");
        setUser(currentUser);
        setIsLoading(false);
      });
    })();

    return () => {
      if (sub) {
        sub.unsubscribe();
      }
    };
  }, []);

  return { user, logout, isLoading };
};
