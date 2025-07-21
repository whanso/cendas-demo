import { z } from "zod";
import { CHECKLIST_STATUS } from "./schemas";

export const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required."),
  checklist: z
    .array(
      z.object({
        item: z.string().min(1, "Checklist item cannot be empty."),
        status: z.enum(Object.keys(CHECKLIST_STATUS) as [string, ...string[]]),
      })
    )
    .min(1, "At least one checklist item is required."),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
