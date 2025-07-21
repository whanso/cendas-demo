import {
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
  type RxCollection,
  type RxDatabase,
  type RxJsonSchema,
} from "rxdb";
export const tasksSchemaLiteral = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
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
          checked: {
            type: "string",
            enum: [
              "Not started",
              "In progress",
              "Blocked",
              "Final Check Awaiting",
              "Done",
            ],
          },
        },
      },
    },
    timestamp: {
      type: "string",
      format: "date-time",
    },
  },
  required: ["id", "title", "checklist", "timestamp"],
} as const;
const schemaTyped = toTypedRxJsonSchema(tasksSchemaLiteral);

export type TaskDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

export const taskSchema: RxJsonSchema<TaskDocType> = tasksSchemaLiteral;

export type TaskCollection = RxCollection<TaskDocType>;

export type DatabaseCollections = {
  tasks: TaskCollection;
};

export type CendasDatabase = RxDatabase<DatabaseCollections>;
