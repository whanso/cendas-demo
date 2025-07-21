import { useState } from "react";
import type { RxDocument } from "rxdb";
import { ArrowRight, Trash2 } from "lucide-react";
import type { TaskDocType, ChecklistStatusKeys } from "@/types/schemas";
import type { TaskFormValues } from "@/types/forms";
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
import { TaskListSkeleton } from "./TaskListSkeleton";
import { Link } from "react-router";
import useTasks from "@/hooks/useTasks";

export default function TaskList() {
  const { tasks, isLoading, deleteTask, updateTask } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] =
    useState<RxDocument<TaskDocType> | null>(null);
  const [statusFilter, setStatusFilter] = useState<ChecklistStatusKeys | "ALL">(
    "ALL"
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] =
    useState<RxDocument<TaskDocType> | null>(null);

  const handleOpenModal = (task: RxDocument<TaskDocType>) => {
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

  const handleUpdateTask = async (data: TaskFormValues) => {
    if (selectedTask) {
      await updateTask(selectedTask.taskId, data);
    }
  };

  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      await deleteTask(taskToDelete);
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

  if (isLoading) {
    return <TaskListSkeleton />;
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">My Tasks</h1>
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
                  onClick={() => handleOpenModal(task)}
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
                    <Link to="/floor-plan">
                      <Button variant="ghost">
                        See floor plan <ArrowRight />{" "}
                      </Button>
                    </Link>
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
        mode="edit"
        task={selectedTask}
        onSubmit={handleUpdateTask}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Task"
        description="This will permanently delete the task and all of its data."
      />
    </div>
  );
}
