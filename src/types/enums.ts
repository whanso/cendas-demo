export const TASK_STATUS = [
  "Not started",
  "In progress",
  "Blocked",
  "Final Check Awaiting",
  "Done",
] as const;


export type TaskStatus = (typeof TASK_STATUS)[number];