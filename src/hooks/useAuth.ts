import { DatabaseContext } from "@/stores/databaseStore";
import type { UserDocType } from "@/types/schemas";
import { useContext, useState } from "react";
import { useDatabase } from "./useDatabase";

export type AuthError = {
  code: "AUTH/USER_NOT_FOUND" | "AUTH/USERNAME_TAKEN" | "AUTH/UNKNOWN_ERROR";
  message: string;
};

export default function useAuth() {
  const [error, setError] = useState<AuthError | null>(null);
  const [isProcessing, setIsProcessing] = useState<"login" | "join" | null>(
    null
  );
  const store = useContext(DatabaseContext);
  if (!store) throw new Error("Missing DatabaseContext.Provider in the tree");

  const { login, logout, findUser, createUser, currentUser, isLoading } =
    useDatabase((state) => ({
      login: state.login,
      logout: state.logout,
      findUser: state.findUser,
      createUser: state.createUser,
      currentUser: state.currentUser,
      isLoading: state.isLoading,
    }));

  const clearError = () => {
    setError(null);
  };

  const loginUser = async (username: string) => {
    clearError();
    try {
      setIsProcessing("login");
      const user = await findUser(username);
      if (user) {
        login(user);
      } else {
        setError({
          code: "AUTH/USER_NOT_FOUND",
          message: "User not found. Would you like to join?",
        });
      }
    } catch (e) {
      setError({
        code: "AUTH/UNKNOWN_ERROR",
        message: e instanceof Error ? e.message : "An unknown error occurred.",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const enrollUser = async (user: Omit<UserDocType, "userId">) => {
    clearError();
    try {
      setIsProcessing("join");
      const existingUser = await findUser(user.username);

      if (existingUser) {
        setError({
          code: "AUTH/USERNAME_TAKEN",
          message: "Username is already taken.",
        });
        return; // The finally block will still execute
      }

      const newUser: UserDocType = {
        userId: crypto.randomUUID(),
        ...user,
      };
      const createdUser = await createUser(newUser);
      login(createdUser);
    } catch (error) {
      setError({
        code: "AUTH/UNKNOWN_ERROR",
        message: "An unexpected error occurred while creating the user.",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  return {
    isLoading,
    currentUser,
    isProcessing,
    error,
    logout,
    clearError,
    loginUser,
    enrollUser,
  };
}
