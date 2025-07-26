import { useEffect, useMemo, useState } from "react";
import InteractiveCanvas from "@/components/InteractiveCanvas";
import { useTaskStoreInitializer } from "@/hooks/useTaskStoreInitializer";
import { useUserStoreInitializer } from "@/hooks/useUserStoreInitializer";
import useTaskStore from "@/stores/taskStore";
import useUserStore from "@/stores/userStore";
import { motion, AnimatePresence } from "framer-motion";

const FLOOR_PLAN_URL = "image.png";

export default function FloorPlan() {
  // This hook initializes the store and sets up the RxDB subscription.
  useTaskStoreInitializer();
  useUserStoreInitializer();

  const taskCount = useTaskStore((state) => state.taskCount);

  return (
    <div className="relative flex-grow overflow-hidden">
      <AnimatePresence>
        {taskCount === 0 && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center pt-4">
            <motion.div
              className="rounded-lg bg-background/90 p-4 text-center shadow-lg backdrop-blur-sm"
              initial={{ opacity: 0, y: "-100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "-100%" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <p className="animate-pulse text-sm">
                Click anywhere on the floor plan to create a task!
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <InteractiveCanvas
        imageUrl={FLOOR_PLAN_URL}
      />
    </div>
  );
}
