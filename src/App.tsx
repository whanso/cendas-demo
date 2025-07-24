// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "@/components/routes/home";
import Layout from "@/components/layouts/layout";
import TasksPage from "@/components/routes/tasks";
import FloorPlan from "@/components/routes/floor-plan";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/floor-plan" element={<FloorPlan />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
