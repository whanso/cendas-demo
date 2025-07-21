import {
  DatabaseContext,
  type DatabaseStoreState,
} from "@/stores/databaseStore";
import { useContext } from "react";
import { useStoreWithEqualityFn } from "zustand/traditional";

export function useDatabase<T>(
  selector: (state: DatabaseStoreState) => T,
  equalityFn?: (a: T, b: T) => boolean
): T {
  const store = useContext(DatabaseContext);
  if (!store) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return useStoreWithEqualityFn(store, selector, equalityFn);
}
