import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { DatabaseProvider } from "./components/DatabaseProvider.tsx";

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <DatabaseProvider>
      <App />
    </DatabaseProvider>
  </StrictMode>
);
