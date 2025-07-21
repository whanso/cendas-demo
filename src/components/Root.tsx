import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { ProtectedRoute } from "./ProtectedRoute";
import Layout from "./layouts/layout";
import TasksPage from "./routes/tasks";
import FloorPlan from "./routes/floor-plan";
import LoginPage from "./routes/login-page";
import Playground from "./routes/playground";

export function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/playground" element={<Playground />} />
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/tasks" replace />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/floor-plan" element={<FloorPlan />} />
          </Route>
        </Route>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}
