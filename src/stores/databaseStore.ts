import { create } from "zustand";
import { type RxDatabase } from "rxdb/plugins/core";
import { getDatabase } from "@/database";
import { type CendasDatabase, type UserDocType } from "@/types/schemas";

interface DatabaseState {
  db: RxDatabase<CendasDatabase> | null;
  authState: {
    user: UserDocType | null;
  };
  isLoading: boolean;
}

export const useDatabaseStore = create<DatabaseState>(() => ({
  db: null,
  authState: {
    user: null,
  },
  isLoading: true,
}));

let isInitialized = false;
export const initializeDatabase = async () => {
  if (isInitialized) return;
  isInitialized = true;

  try {
    const { db, authState } = await getDatabase();
    useDatabaseStore.setState({ db, authState, isLoading: false });
  } catch (error) {
    console.error("Failed to initialize database", error);
    useDatabaseStore.setState({ isLoading: false }); // Or handle error state
  }
};
