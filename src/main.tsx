import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { addRxPlugin, createRxDatabase } from "rxdb/plugins/core";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import { getRxStorageLocalstorage } from "rxdb/plugins/storage-localstorage";
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv";
import { taskSchema, type CendasDatabase } from "./types/schemas.ts";

addRxPlugin(RxDBDevModePlugin);

const myDatabase = await createRxDatabase<CendasDatabase>({
  name: "mydatabase",
  storage: wrappedValidateAjvStorage({
    storage: getRxStorageLocalstorage(),
  }),
});

await myDatabase.addCollections({
  tasks: { schema: taskSchema },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
