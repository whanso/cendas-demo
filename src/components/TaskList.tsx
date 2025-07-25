import { useEffect, useState } from "react";
import type { RxDocument } from "rxdb";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/auth";
import { useDatabase } from "@/components/DatabaseProvider";
import type { TaskDocType, ChecklistStatusKeys } from "@/types/schemas";
import { Button } from "@/components/ui/button";
import { TaskStatus, getTaskStatus } from "@/components/TaskStatus";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TaskModal } from "./TaskModal";
import { TaskFilter } from "./TaskFilter";
import { EmptyState } from "./EmptyState";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

export default function TaskList() {
  const db = useDatabase();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<RxDocument<TaskDocType>[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedTask, setSelectedTask] =
    useState<RxDocument<TaskDocType> | null>(null);
  const [statusFilter, setStatusFilter] = useState<ChecklistStatusKeys | "ALL">(
    "ALL"
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] =
    useState<RxDocument<TaskDocType> | null>(null);

  useEffect(() => {
    if (!db?.tasks || !user?.userId) return;

    const subscription = db.tasks
      .find({
        selector: {
          userId: user.userId,
        },
        sort: [{ timestamp: "asc" }],
      })
      .$.subscribe((tasks) => {
        if (tasks) {
          setTasks(tasks);
        }
      });

    return () => subscription.unsubscribe();
  }, [db, user]);

  const handleOpenModal = (
    mode: "create" | "edit",
    task: RxDocument<TaskDocType> | null = null
  ) => {
    setModalMode(mode);
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = (task: RxDocument<TaskDocType>) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      await taskToDelete.remove();
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (statusFilter === "ALL") {
      return true;
    }
    return getTaskStatus(task) === statusFilter;
  });

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">My Tasks</h1>
        <Button onClick={() => handleOpenModal("create")}>Add Task</Button>
      </div>
      <TaskFilter
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Status</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-[150px]">Progress</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const completedItems = task.checklist.filter(
                (item) => item.status === "DONE"
              ).length;
              const totalItems = task.checklist.length;
              return (
                <TableRow
                  key={task.taskId}
                  onClick={() => handleOpenModal("edit", task)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <TaskStatus task={task} />
                  </TableCell>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {completedItems} / {totalItems}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTask(task);
                      }}
                    >
                      <Trash2 className="h-4 w-4 " />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={4}>
                <EmptyState
                  title={
                    tasks.length === 0
                      ? "You have no tasks yet"
                      : "No tasks found"
                  }
                  description={
                    tasks.length === 0
                      ? "Create a new task to get started."
                      : "Try adjusting your filters to find what you're looking for."
                  }
                >
                  {tasks.length === 0 && (
                    <Button onClick={() => handleOpenModal("create")}>
                      Create Task
                    </Button>
                  )}
                </EmptyState>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        task={selectedTask}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Are you sure you want to delete this task?"
        description="This action cannot be undone. This will permanently delete the task and all of its data."
      />
    </div>
  );
}
