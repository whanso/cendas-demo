import { create } from "zustand";
import type { RxDatabase, RxDocument } from "rxdb";
import type { CendasDatabase, UserDocType } from "@/types/schemas";
import { Subscription } from "rxjs";

interface UserState {
  users: RxDocument<UserDocType>[];
  usersMap: Map<string, RxDocument<UserDocType>>;
  isLoading: boolean;
  isInitialized: boolean;
  _subscription: Subscription | null;
}

interface UserActions {
  initialize: (db: RxDatabase<CendasDatabase>) => void;
  cleanup: () => void;
}

const useUserStore = create<UserState & UserActions>((set, get) => ({
  users: [],
  usersMap: new Map(),
  isLoading: true,
  isInitialized: false,
  _subscription: null,

  initialize: (db) => {
    if (get().isInitialized) return;

    set({ isLoading: true, isInitialized: true });

    const subscription = db.users.find().$.subscribe((users) => {
      if (users) {
        const usersMap = new Map(users.map((u) => [u.userId, u]));
        set({ users, usersMap, isLoading: false });
      }
    });

    set({ _subscription: subscription });
  },

  cleanup: () => {
    get()._subscription?.unsubscribe();
    set({
      isInitialized: false,
      _subscription: null,
      users: [],
      usersMap: new Map(),
    });
  },
}));

export default useUserStore;
