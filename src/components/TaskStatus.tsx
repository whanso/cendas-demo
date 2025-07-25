import type { TaskDocType, ChecklistStatusKeys } from "@/types/schemas";
import { StatusIcon } from "./StatusIcon";

/**
 * Determines the overall status of a task based on its checklist items.
 * The logic is as follows, in order of precedence:
 * - If any item is BLOCKED, the task is BLOCKED.
 * - If all items are DONE, the task is DONE.
 * - If any item is FINAL_CHECK_AWAITING, the task is FINAL_CHECK_AWAITING.
 * - If any item is IN_PROGRESS (or there's a mix of other statuses like NOT_STARTED and DONE), the task is IN_PROGRESS.
 * - If all items are NOT_STARTED, the task is NOT_STARTED.
 * - If the checklist is empty, it's considered NOT_STARTED.
 * @param task The task document.
 * @returns The calculated status of the task.
 */
export const getTaskStatus = (task: TaskDocType): ChecklistStatusKeys => {
  const { checklist } = task;

  if (!checklist || checklist.length === 0) {
    return "NOT_STARTED";
  }

  const statuses = checklist.map((item) => item.status);

  if (statuses.includes("BLOCKED")) {
    return "BLOCKED";
  }

  if (statuses.every((s) => s === "DONE")) {
    return "DONE";
  }

  if (statuses.includes("FINAL_CHECK_AWAITING")) {
    return "FINAL_CHECK_AWAITING";
  }

  if (statuses.includes("IN_PROGRESS")) {
    return "IN_PROGRESS";
  }

  // A mix of NOT_STARTED and DONE is considered IN_PROGRESS
  if (statuses.some((s) => s === "DONE")) {
    return "IN_PROGRESS";
  }

  // If we've gotten this far, the only remaining possibility is that all items are NOT_STARTED.
  return "NOT_STARTED";
};

interface TaskStatusProps {
  task: TaskDocType;
  className?: string;
}

export function TaskStatus({ task, className }: TaskStatusProps) {
  const status = getTaskStatus(task);
  return <StatusIcon status={status} className={className} />;
}