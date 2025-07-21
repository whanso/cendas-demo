import { useEffect, type ReactNode } from "react";
import { type RxDatabase } from "rxdb/plugins/core";
import { type CendasDatabase } from "@/types/schemas";
import {
  useDatabaseStore,
  initializeDatabase,
} from "@/stores/databaseStore";

export const DatabaseProvider = ({ children }: { children: ReactNode }) => {
  const { isLoading } = useDatabaseStore();

  useEffect(() => {
    initializeDatabase();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export const useDatabase = (): RxDatabase<CendasDatabase> => {
  const db = useDatabaseStore((state) => state.db);
  if (!db) {
    throw new Error(
      "useDatabase must be used within a child of DatabaseProvider"
    );
  }
  return db;
};