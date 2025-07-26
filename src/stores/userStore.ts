import { create } from "zustand";
import type { RxDatabase, RxDocument } from "rxdb";
import type { CendasDatabase, UserDocType } from "@/types/schemas";
import { Subscription } from "rxjs";
interface UserState {
  currentUser: RxDocument<UserDocType> | null;
  isLoading: boolean;
  isInitialized: boolean;
  _subscription: Subscription | null;
}

interface UserActions {
  initialize: (db: RxDatabase<CendasDatabase>, userId: string) => void;
  cleanup: () => void;
}

const useUserStore = create<UserState & UserActions>((set, get) => ({
  currentUser: null,
  isLoading: true,
  isInitialized: false,
  _subscription: null,

  initialize: (db, userId) => {
    if (get().isInitialized) return;

    set({ isLoading: true, isInitialized: true });

    const subscription = db.users.find().$.subscribe((users) => {
      if (users) {
        const usersMap = new Map(users.map((u) => [u.userId, u]));
        const currentUser = usersMap.get(userId) || null;
        console.log(usersMap);
        console.log(userId);
        console.log(currentUser);
        set({ currentUser, isLoading: false });
      }
    });

    set({ _subscription: subscription });
  },

  cleanup: () => {
    get()._subscription?.unsubscribe();
    set({
      isInitialized: false,
      _subscription: null,
      currentUser: null,
    });
  },
}));

export default useUserStore;
