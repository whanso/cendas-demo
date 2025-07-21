import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { getDatabase } from "./database.ts";
import { DatabaseProvider } from "./stores/databaseStore.tsx";

getDatabase().then(({ db, authState }) =>
  createRoot(document.getElementById("root")!).render(
    <DatabaseProvider db={db} authState={authState}>
      <StrictMode>
        <App />
      </StrictMode>
    </DatabaseProvider>
  )
);
