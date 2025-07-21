import { useDatabase } from "./useDatabase";

export default function useTasks() {
  return useDatabase((state) => ({
    tasks: state.tasks,
    isLoading: state.isLoading,
    addTask: state.addTask,
    updateTask: state.updateTask,
    deleteTask: state.deleteTask,
    taskCount: state.tasks.length,
    updatePinPosition: state.updatePinPosition,
  }));
}
