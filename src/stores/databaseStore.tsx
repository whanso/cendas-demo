import { createStore } from "zustand";

import { type RxDatabase, type RxDocument, type RxState } from "rxdb";
import { type Subscription } from "rxjs";
import {
  type CendasDatabase,
  type UserDocType,
  type TaskDocType,
} from "@/types/schemas";
import { createContext, useEffect, useRef } from "react";
import type { TaskFormValues } from "@/types/forms";
import type { AuthState } from "@/database";

// Props for initializing the store, from `getDatabase()` in main.tsx
interface DatabaseProps {
  db: RxDatabase<CendasDatabase>;
  authState: AuthState;
}

// The state of the store
export interface DatabaseState {
  isInitialized: boolean;
  isLoading: boolean;
  tasks: RxDocument<TaskDocType>[];
  currentUser: UserDocType | null;
  _authState: AuthState;
  _db: RxDatabase<CendasDatabase>;
  _tasksSubscription: Subscription | null;
}

// The actions of the store
export interface DatabaseActions {
  initialize: () => void;
  findUser: (username: string) => Promise<UserDocType | null>;
  createUser: (user: UserDocType) => Promise<UserDocType>;
  login: (user: UserDocType) => void;
  logout: () => void;
  cleanup: () => void;
  addTask: (
    taskData: TaskFormValues,
    position: { x: number; y: number }
  ) => Promise<void>;
  updateTask: (taskId: string, taskData: TaskFormValues) => Promise<void>;
  updatePinPosition: (
    taskId: string,
    coords: { x: number; y: number }
  ) => Promise<void>;
  deleteTask: (task: RxDocument<TaskDocType>) => Promise<void>;
}

export type DatabaseStoreState = DatabaseState & DatabaseActions;

type DatabaseStore = ReturnType<typeof createDatabaseStore>;

export const createDatabaseStore = (initProps: DatabaseProps) => {
  return createStore<DatabaseStoreState>()((set, get) => ({
    isLoading: true,
    isInitialized: false,
    tasks: [],
    currentUser: initProps.authState.currentUser ?? null,
    _authState: initProps.authState,
    _db: initProps.db,
    _tasksSubscription: null,

    initialize: () => {
      const {
        _db,
        _authState: { currentUser },
      } = get();
      const userId = currentUser?.userId;

      // Prevent re-initialization
      if (get().isInitialized) return;

      set({ isLoading: false, isInitialized: true });

      if (userId) {
        const subscription = _db.tasks
          .find({
            selector: { userId },
            sort: [{ timestamp: "asc" }],
          })
          .$.subscribe((tasks) => {
            if (tasks) {
              set({ tasks, isLoading: false });
            }
          });

        set({ _tasksSubscription: subscription });
      }
    },

    findUser: async (username) => {
      const user = await get()
        ._db.users.findOne({
          selector: {
            username: username,
          },
        })
        .exec();

      return user ? user.toJSON() : null;
    },

    createUser: async (user) => {
      const createdUser = await get()._db.users.insert(user);
      return createdUser.toJSON();
    },

    login: (user) => {
      const subscription = get()
        ._db.tasks.find({
          selector: { userId: user.userId },
          sort: [{ timestamp: "asc" }],
        })
        .$.subscribe((tasks) => {
          if (tasks) {
            set({ tasks, isLoading: false });
          }
        });

      set({ _tasksSubscription: subscription });
      const { _authState } = get();
      _authState.set("currentUser", () => user);
      set({ currentUser: user });
    },

    logout: () => {
      get().cleanup();
    },

    cleanup: () => {
      get()._tasksSubscription?.unsubscribe();
      get()._authState.set("currentUser", () => null);
      set({
        isLoading: false,
        isInitialized: false,
        tasks: [],
        currentUser: null,
        _tasksSubscription: null,
      });
    },

    addTask: async (data, position) => {
      const {
        _db,
        _authState: { currentUser },
      } = get();
      if (!_db || !currentUser)
        throw new Error("Store not initialized or user not found");

      const newTask: TaskDocType = {
        taskId: crypto.randomUUID(),
        title: data.title.trim(),
        checklist: data.checklist.filter((item) => item.item.trim() !== ""),
        timestamp: new Date().toISOString(),
        position,
        userId: currentUser.userId,
      };
      await _db.tasks.insert(newTask);
    },

    updateTask: async (taskId, data) => {
      const taskDoc = get().tasks.find((t) => t.taskId === taskId);
      if (taskDoc) {
        await taskDoc.patch({
          title: data.title.trim(),
          checklist: data.checklist.filter((item) => item.item.trim() !== ""),
        });
      }
    },

    deleteTask: async (task) => {
      await task.remove();
    },

    updatePinPosition: async (taskId, coords) => {
      const taskDoc = get().tasks.find((t) => t.taskId === taskId);
      await taskDoc?.patch({ position: { x: coords.x, y: coords.y } });
    },
  }));
};

export const DatabaseContext = createContext<DatabaseStore | null>(null);

type DatabaseProviderProps = React.PropsWithChildren<DatabaseProps>;

export function DatabaseProvider({
  children,
  ...props
}: DatabaseProviderProps) {
  const storeRef = useRef<DatabaseStore | undefined>(undefined);
  if (!storeRef.current) {
    storeRef.current = createDatabaseStore(props);
  }

  useEffect(() => {
    const store = storeRef.current!;
    store.getState().initialize();

    return () => {
      store.getState().cleanup();
    };
  }, []);

  return (
    <DatabaseContext.Provider value={storeRef.current}>
      {children}
    </DatabaseContext.Provider>
  );
}
