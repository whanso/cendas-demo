import { useEffect, useState } from "react";
import type { RxDocument } from "rxdb";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/auth";
import { useDatabase } from "@/components/DatabaseProvider";
import type { TaskDocType } from "@/types/schemas";
import { Button } from "@/components/ui/button";
import { TaskStatus } from "@/components/TaskStatus";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TaskModal } from "./TaskModal";

export default function TaskList() {
  const db = useDatabase();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<RxDocument<TaskDocType>[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedTask, setSelectedTask] =
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

  const handleDeleteTask = async (task: RxDocument<TaskDocType>) => {
    await task.remove();
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">My Tasks</h1>
        <Button onClick={() => handleOpenModal("create")}>Add Task</Button>
      </div>
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
          {tasks.map((task) => {
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
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTask(task);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        task={selectedTask}
      />
    </div>
  );
}
