import {
  addRxPlugin,
  createRxDatabase,
  type RxDatabase,
  type RxState,
} from "rxdb/plugins/core";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import { RxDBStatePlugin } from "rxdb/plugins/state";
import { getRxStorageLocalstorage } from "rxdb/plugins/storage-localstorage";
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv";
import {
  userSchema,
  taskSchema,
  type CendasDatabase,
  type UserDocType,
} from "./types/schemas.ts";

// It's a good practice to move plugin addition to the database module
// to ensure it's done only once.
addRxPlugin(RxDBDevModePlugin);
addRxPlugin(RxDBStatePlugin);

export type AuthState = RxState<{
  currentUser: UserDocType | null;
}>;

type RxDbSetup = {
  db: RxDatabase<CendasDatabase>;
  authState: AuthState;
};

let dbPromise: Promise<RxDbSetup> | null = null;

const createDb = async (): Promise<RxDbSetup> => {
  const db = await createRxDatabase<CendasDatabase>({
    name: "mydatabase",
    storage: wrappedValidateAjvStorage({
      storage: getRxStorageLocalstorage(),
    }),
  });

  await db.addCollections({
    users: { schema: userSchema },
    tasks: { schema: taskSchema },
  });

  const authState = await db.addState<any>();

  return { db, authState };
};

export const getDatabase = (): Promise<RxDbSetup> => {
  if (!dbPromise) {
    dbPromise = createDb();
  }
  return dbPromise;
};
