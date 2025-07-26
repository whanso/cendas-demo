import {
  type RxJsonSchema,
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
  type RxCollection,
  type RxDocument,
  type RxDatabase,
} from "rxdb";

export const CHECKLIST_STATUS = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  BLOCKED: "Blocked",
  FINAL_CHECK_AWAITING: "Final Check Awaiting",
  DONE: "Done",
} as const;

type ObjectValues<T> = T[keyof T];
export type ChecklistStatusKeys = keyof typeof CHECKLIST_STATUS;
export type ChecklistStatus = ObjectValues<typeof CHECKLIST_STATUS>;

export const userSchemaLiteral = {
  title: "user schema",
  description: "describes a user",
  version: 0,
  primaryKey: "userId",
  type: "object",
  properties: {
    userId: {
      type: "string",
      maxLength: 100,
    },
    username: {
      type: "string",
      maxLength: 100,
    },
    userColor: {
      type: "string",
    },
  },
  required: ["username", "userId", "userColor"],
  indexes: ["username"],
} as const;

export const taskSchemaLiteral = {
  title: "task schema",
  description: "describes a task",
  version: 0,
  primaryKey: "taskId",
  type: "object",
  properties: {
    taskId: {
      type: "string",
      maxLength: 100,
    },
    title: {
      type: "string",
    },
    checklist: {
      type: "array",
      items: {
        type: "object",
        properties: {
          item: {
            type: "string",
          },
          status: {
            type: "string",
            enum: Object.keys(CHECKLIST_STATUS),
          },
        },
        required: ["item", "status"],
      },
    },
    position: {
      type: "object",
      properties: {
        x: {
          type: "number",
        },
        y: {
          type: "number",
        },
      },
      required: ["x", "y"],
    },
    timestamp: {
      type: "string",
      format: "date-time",
    },
    userId: {
      type: "string",
      maxLength: 100,
    },
  },
  required: ["taskId", "title", "checklist", "timestamp", "userId", "position"],
  indexes: ["userId"],
} as const;

const userSchemaTyped = toTypedRxJsonSchema(userSchemaLiteral);
const taskSchemaTyped = toTypedRxJsonSchema(taskSchemaLiteral);

export type UserDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof userSchemaTyped
>;
export type TaskDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof taskSchemaTyped
>;

export const userSchema: RxJsonSchema<UserDocType> = userSchemaLiteral;
export const taskSchema: RxJsonSchema<TaskDocType> = taskSchemaLiteral;

export type UserDocument = RxDocument<UserDocType>;
export type UserCollection = RxCollection<UserDocType>;

export type TaskDocument = RxDocument<TaskDocType>;
export type TaskCollection = RxCollection<TaskDocType>;

export type CendasDatabaseCollections = {
  users: UserCollection;
  tasks: TaskCollection;
};

export type CendasDatabase = RxDatabase<CendasDatabaseCollections>;
