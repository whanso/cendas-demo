import { create } from "zustand";
import type { RxDatabase, RxDocument } from "rxdb";
import type { CendasDatabase, TaskDocType, UserDocType } from "@/types/schemas";
import type { TaskFormValues } from "@/types/forms";
import { Subscription } from "rxjs";

interface TaskState {
  tasks: RxDocument<TaskDocType>[];
  isLoading: boolean;
  isInitialized: boolean;
  user: UserDocType | null;
  // We'll hold references to the db and subscription to manage lifecycle
  _subscription: Subscription | null;
  _db: RxDatabase<CendasDatabase> | null;
}

interface TaskActions {
  initialize: (db: RxDatabase<CendasDatabase>, user: UserDocType) => void;
  cleanup: () => void;
  addTask: (
    taskData: TaskFormValues,
    position: { x: number; y: number }
  ) => Promise<void>;
  updateTask: (taskId: string, taskData: TaskFormValues) => Promise<void>;
  deleteTask: (task: RxDocument<TaskDocType>) => Promise<void>;
  updatePinPosition: (
    taskId: string,
    coords: { x: number; y: number }
  ) => Promise<void>;
}

const useTaskStore = create<TaskState & TaskActions>((set, get) => ({
  tasks: [],
  isLoading: true,
  isInitialized: false,
  user: null,
  _subscription: null,
  _db: null,

  initialize: (db, user) => {
    // Prevent re-initialization
    if (get().isInitialized) return;

    set({ _db: db, user, isLoading: true, isInitialized: true });

    const subscription = db.tasks
      .find({
        selector: { userId: user.userId },
        sort: [{ timestamp: "asc" }],
      })
      .$.subscribe((tasks) => {
        if (tasks) {
          set({ tasks, isLoading: false });
        }
      });

    set({ _subscription: subscription });
  },

  cleanup: () => {
    get()._subscription?.unsubscribe();
    set({
      isInitialized: false,
      _subscription: null,
      _db: null,
      tasks: [],
      user: null,
    });
  },

  addTask: async (data, position) => {
    const { _db, user } = get();
    if (!_db || !user)
      throw new Error("Store not initialized or user not found");

    const newTask: TaskDocType = {
      taskId: crypto.randomUUID(),
      title: data.title.trim(),
      checklist: data.checklist.filter((item) => item.item.trim() !== ""),
      timestamp: new Date().toISOString(),
      position,
      userId: user.userId,
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

export default useTaskStore;
