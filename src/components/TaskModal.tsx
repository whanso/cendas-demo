import { useEffect } from "react";
import type { RxDocument } from "rxdb";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CHECKLIST_STATUS,
  type ChecklistStatus,
  type ChecklistStatusKeys,
  type TaskDocType,
} from "@/types/schemas";
import { taskFormSchema, type TaskFormValues } from "@/types/forms";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { StatusIcon } from "./StatusIcon";

const initialCreateValues: TaskFormValues = {
  title: "",
  checklist: [{ item: "Placeholder item", status: "NOT_STARTED" }],
};

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  task?: RxDocument<TaskDocType> | null;
  onSubmit: (data: TaskFormValues) => Promise<void>;
}

export function TaskModal({
  isOpen, onClose, mode, task, onSubmit,
}: TaskModalProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    mode: "onSubmit",
    defaultValues: initialCreateValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "checklist",
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && task) {
        form.reset({
          title: task.title,
          checklist: task.checklist || [],
        });
      } else {
        form.reset(initialCreateValues);
      }
    }
  }, [isOpen, mode, task, form]);

  const handleFormSubmit = async (data: TaskFormValues) => {
    // The parent component now handles the submission logic.
    await onSubmit(data);
    onClose();
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Task" : "Edit Task"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Fill in the details for the new task."
              : "Make changes to your task here. Click save when you're done."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Task name" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Checklist</Label>
              {fields.map((field, index) => {
                const status = form.watch(`checklist.${index}.status`);
                return (
                  <div key={field.id} className="flex items-start gap-2 ">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="h-9 flex items-center gap-1 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full pr-2 cursor-pointer"
                        >
                          <StatusIcon
                            className="text-lg"
                            status={status as ChecklistStatusKeys}
                          />
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {Object.entries(CHECKLIST_STATUS).map(
                          ([key, value]) => (
                            <DropdownMenuItem
                              key={key}
                              onClick={() =>
                                form.setValue(
                                  `checklist.${index}.status`,
                                  key as ChecklistStatusKeys
                                )
                              }
                            >
                              <StatusIcon
                                className="mr-2"
                                status={key as ChecklistStatusKeys}
                              />
                              <span>{value}</span>
                            </DropdownMenuItem>
                          )
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <FormField
                      control={form.control}
                      name={`checklist.${index}.item`}
                      render={({ field }) => (
                        <FormItem className="flex-grow">
                          <FormControl>
                            <Input placeholder="Checklist item" {...field} />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full h-8 w-8"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 " />
                      </Button>
                    )}
                  </div>
                );
              })}
              <Button
                type="button"
                variant="ghost"
                onClick={() => append({ item: "", status: "NOT_STARTED" })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Item
              </Button>
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
