import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Image, Shape } from "react-konva";
import Konva from "konva";
import useImage from "use-image";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { TaskModal } from "./TaskModal";
import type { TaskFormValues } from "@/types/forms";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TaskDocType } from "@/types/schemas";
import type { RxDocument } from "rxdb";
import useTasks from "@/hooks/useTasks";
import useAuth from "@/hooks/useAuth";

// by default Konva prevent some events when node is dragging
// it improve the performance and work well for 95% of cases
// we need to enable all events on Konva, even when we are dragging a node
// so it triggers touchmove correctly.
(window as any).Konva.hitOnDragEnabled = true;

const getInitials = (name = "") => {
  const words = name.split(" ");
  if (words.length > 1 && words[1]) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

interface ConstructionPlanKonvaProps {
  imageUrl: string;
}

export default function InteractiveCanvas({
  imageUrl,
}: ConstructionPlanKonvaProps) {
  const { tasks, addTask, updatePinPosition, deleteTask, updateTask } =
    useTasks();
  const { currentUser } = useAuth();
  const stageRef = useRef<Konva.Stage>(null);
  const [image] = useImage(imageUrl, "anonymous");
  // Reference to parent container
  const containerRef = useRef<HTMLDivElement>(null);
  const lastCenter = useRef<{ x: number; y: number } | null>(null);
  const lastDist = useRef(0);
  const dragStopped = useRef(false);

  // State to track stage dimensions
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [stageTransform, setStageTransform] = useState({
    scale: 1,
    x: 0,
    y: 0,
  });
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    taskId: string | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    taskId: null,
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pinToDelete, setPinToDelete] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPinCoords, setNewPinCoords] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<RxDocument<TaskDocType> | null>(
    null
  );

  const tasksWithPins = useMemo(
    () =>
      tasks.filter(
        (task) => task.userId === currentUser?.userId && task.position
      ),
    [tasks, currentUser]
  );

  // Function to handle resize
  const updateSize = useCallback(() => {
    if (!containerRef.current || !image || !stageRef.current) return;

    const { offsetWidth: containerWidth, offsetHeight: containerHeight } =
      containerRef.current;

    // Update stage size to fill the container
    setStageSize({ width: containerWidth, height: containerHeight });

    const stage = stageRef.current;

    // Calculate scale and position to fit and center the image within the stage
    const scaleX = containerWidth / image.width;
    const scaleY = containerHeight / image.height;
    const scale = Math.min(scaleX, scaleY);

    const x = (containerWidth - image.width * scale) / 2;
    const y = (containerHeight - image.height * scale) / 2;

    // Transform the stage to apply the new scale and position
    stage.scale({ x: scale, y: scale });
    stage.position({ x, y });

    // Update React state
    setStageTransform({ scale, x, y });
  }, [image]);

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    // how to scale? Zoom in? Or zoom out?
    let direction = e.evt.deltaY > 0 ? 1 : -1;

    // when we zoom on trackpad, e.evt.ctrlKey is true
    // in that case lets revert direction
    if (e.evt.ctrlKey) {
      direction = -direction;
    }

    const scaleBy = 1.02;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    stage.scale({ x: newScale, y: newScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);

    // Update React state
    setStageTransform({ scale: newScale, x: newPos.x, y: newPos.y });

    // Manually update pin scales to avoid render lag.
    // The React state update will still happen, but this ensures
    // the visual update is synchronous with the gesture.
    const pinsLayer = stage.findOne<Konva.Layer>("#pins-layer");
    pinsLayer?.children?.forEach((pin) => {
      pin.scale({ x: 1 / newScale, y: 1 / newScale });
    });
  };

  const handleStageClick = (
    e: Konva.KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    // If context menu is open, a click on the stage should just close it.
    if (contextMenu.visible) {
      setContextMenu({ ...contextMenu, visible: false });
      return;
    }

    // Only create a pin if the click is on the stage background or the main image.
    // This prevents creating a new pin when clicking on an existing pin or its layer.
    if (e.target.className !== "Stage" && e.target.className !== "Image") {
      return;
    }

    if (e.target.isDragging()) {
      return;
    }
    const stage = e.target.getStage();
    const pos = stage?.getRelativePointerPosition();
    if (pos) {
      setNewPinCoords(pos);
      setIsCreateModalOpen(true);
    }
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setNewPinCoords(null);
  };

  const handleCreateTask = async (data: TaskFormValues) => {
    if (newPinCoords) {
      await addTask(data, newPinCoords);
    }
  };

  const handleUpdateTask = async (data: TaskFormValues) => {
    if (taskToEdit) {
      await updateTask(taskToEdit.taskId, data);
    }
  };

  const getDistance = (
    p1: { x: number; y: number },
    p2: { x: number; y: number }
  ) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  const getCenter = (
    p1: { x: number; y: number },
    p2: { x: number; y: number }
  ) => {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  };

  const handleTouchMove = (e: Konva.KonvaEventObject<TouchEvent>) => {
    e.evt.preventDefault();
    const touch1 = e.evt.touches[0];
    const touch2 = e.evt.touches[1];
    const stage = stageRef.current;
    if (!stage) return;

    // we need to restore dragging, if it was cancelled by multi-touch
    if (touch1 && !touch2 && !stage.isDragging() && dragStopped.current) {
      stage.startDrag();
      dragStopped.current = false;
    }

    if (touch1 && touch2) {
      // if the stage was under Konva's drag&drop
      // we need to stop it, and implement our own pan logic with two pointers
      if (stage.isDragging()) {
        stage.stopDrag();
        dragStopped.current = true;
      }

      const p1 = { x: touch1.clientX, y: touch1.clientY };
      const p2 = { x: touch2.clientX, y: touch2.clientY };

      const newCenter = getCenter(p1, p2);
      if (!lastCenter.current) {
        lastCenter.current = newCenter;
        return;
      }

      const dist = getDistance(p1, p2);
      if (!lastDist.current) {
        lastDist.current = dist;
        return;
      }

      // local coordinates of center point
      const oldScale = stage.scaleX();
      const pointTo = {
        x: (newCenter.x - stage.x()) / oldScale,
        y: (newCenter.y - stage.y()) / oldScale,
      };

      const newScale = oldScale * (dist / lastDist.current);
      stage.scale({ x: newScale, y: newScale });

      // calculate new position of the stage
      const dx = newCenter.x - lastCenter.current.x;
      const dy = newCenter.y - lastCenter.current.y;

      const newPos = {
        x: newCenter.x - pointTo.x * newScale + dx,
        y: newCenter.y - pointTo.y * newScale + dy,
      };
      stage.position(newPos);
      setStageTransform({ scale: newScale, x: newPos.x, y: newPos.y });

      // Manually update pin scales to avoid render lag on mobile.
      // The React state update will still happen, but this ensures
      // the visual update is synchronous with the gesture.
      const pinsLayer = stage.findOne<Konva.Layer>("#pins-layer");
      pinsLayer?.children?.forEach((pin) => {
        pin.scale({ x: 1 / newScale, y: 1 / newScale });
      });

      lastDist.current = dist;
      lastCenter.current = newCenter;
    }
  };

  const handleTouchEnd = () => {
    lastDist.current = 0;
    lastCenter.current = null;
  };

  const handlePinClick = (
    e: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
    taskId: string
  ) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    // Get pointer position relative to the stage container
    const pos = stage.getPointerPosition();
    if (!pos) return;

    setContextMenu({
      visible: true,
      x: pos.x,
      y: pos.y,
      taskId,
    });
  };

  const handleDeletePin = () => {
    if (!contextMenu.taskId) return;
    setPinToDelete(contextMenu.taskId);
    setIsDeleteModalOpen(true);
  };

  const handleEditPin = () => {
    if (!contextMenu.taskId) return;
    const task = tasks.find((t) => t.taskId === contextMenu.taskId);
    if (task) {
      setTaskToEdit(task);
      setIsEditModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pinToDelete) return;
    const taskDoc = tasks.find((t) => t.taskId === pinToDelete);
    if (taskDoc) {
      await deleteTask(taskDoc);
    }
    setIsDeleteModalOpen(false);
    setPinToDelete(null);
  };

  const handlePinDragStart = () => {
    if (contextMenu.visible) {
      setContextMenu({ ...contextMenu, visible: false });
    }
  };

  const handlePinDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    // A pin was dragged, update its position in the store
    const shape = e.target;
    const id = shape.id(); // Assumes the shape's id is set to the task's id
    updatePinPosition(id, { x: shape.x(), y: shape.y() });
  };

  const handleStageDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    // This handler is for the stage itself.
    // We only update the stage transform if the stage was the drag target.
    if (e.target.className === "Stage") {
      const stage = e.target as Konva.Stage;
      setStageTransform({
        scale: stage.scaleX(),
        x: stage.x(),
        y: stage.y(),
      });
    }
  };

  // Update on mount, when window resizes, or when image loads
  useEffect(() => {
    updateSize();
    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, [image, updateSize]);

  return (
    <div
      id="canvas-container"
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "relative" }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        draggable
        onWheel={handleWheel}
        onClick={handleStageClick}
        onTap={handleStageClick}
        onDragEnd={handleStageDragEnd}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Layer>
          <Image image={image} />
        </Layer>
        <Layer id="pins-layer">
          {tasksWithPins.map((task) => {
            return (
              <Shape
                key={task.taskId}
                id={task.taskId}
                x={task.position.x}
                y={task.position.y}
                width={30}
                height={45}
                offsetX={30 / 2}
                offsetY={45}
                scaleX={1 / stageTransform.scale}
                scaleY={1 / stageTransform.scale}
                onClick={(e: Konva.KonvaEventObject<MouseEvent>) =>
                  handlePinClick(e, task.taskId)
                }
                onTap={(e: Konva.KonvaEventObject<TouchEvent>) =>
                  handlePinClick(e, task.taskId)
                }
                onDragStart={handlePinDragStart}
                onDragEnd={handlePinDragEnd}
                sceneFunc={function (context, shape) {
                  const width = shape.width();
                  const height = shape.height();
                  const radius = width / 2;

                  context.beginPath();
                  context.moveTo(0, radius); // Start at left side of circle
                  // Top arc
                  context.arc(radius, radius, radius, Math.PI, 0, false);
                  // Right curve to tip
                  context.quadraticCurveTo(
                    width,
                    height * 0.65,
                    radius,
                    height
                  );
                  // Left curve from tip to start
                  context.quadraticCurveTo(0, height * 0.65, 0, radius);
                  context.closePath();

                  // (!) Konva specific method, it is very important
                  context.fillStrokeShape(shape);

                  // Add text inside the pin
                  const text = getInitials(currentUser?.username);
                  context.font = "bold 13px Arial";
                  context.fillStyle = "white";
                  context.textAlign = "center";
                  context.textBaseline = "middle";
                  // Position text in the center of the circular part of the pin
                  context.fillText(text, radius, radius);
                }}
                fill={currentUser?.userColor || "#E53E3E"}
                stroke="black"
                strokeWidth={2}
                draggable
              />
            );
          })}
          {/* Temporary pin for creation */}
          {newPinCoords && (
            <Shape
              x={newPinCoords.x}
              y={newPinCoords.y}
              width={30}
              height={45}
              offsetX={30 / 2}
              offsetY={45}
              scaleX={1 / stageTransform.scale}
              scaleY={1 / stageTransform.scale}
              sceneFunc={function (context, shape) {
                const width = shape.width();
                const height = shape.height();
                const radius = width / 2;

                context.beginPath();
                context.moveTo(0, radius); // Start at left side of circle
                // Top arc
                context.arc(radius, radius, radius, Math.PI, 0, false);
                // Right curve to tip
                context.quadraticCurveTo(width, height * 0.65, radius, height);
                // Left curve from tip to start
                context.quadraticCurveTo(0, height * 0.65, 0, radius);
                context.closePath();
                // (!) Konva specific method, it is very important
                context.fillStrokeShape(shape);

                // Add text inside the pin
                const text = getInitials(currentUser?.username);
                context.font = "bold 13px Arial";
                context.fillStyle = "white";
                context.textAlign = "center";
                context.textBaseline = "middle";
                // Position text in the center of the circular part of the pin
                context.fillText(text, radius, radius);
              }}
              fill={currentUser?.userColor || "#A0AEC0"}
              stroke="black"
              strokeWidth={2}
              opacity={0.8}
              listening={false} // This pin should not be interactive
            />
          )}
        </Layer>
      </Stage>
      <DropdownMenu
        open={contextMenu.visible}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setContextMenu({ ...contextMenu, visible: false, taskId: null });
          }
        }}
      >
        <DropdownMenuTrigger
          style={{
            position: "absolute",
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
            visibility: "hidden",
          }}
        />
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleEditPin}>Edit</DropdownMenuItem>
          <DropdownMenuItem className="text-red-500" onClick={handleDeletePin}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Task"
        description="This will permanently delete the task and all of its data."
      />
      <TaskModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        mode="create"
        onSubmit={handleCreateTask}
      />
      <TaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        mode="edit"
        task={taskToEdit}
        onSubmit={handleUpdateTask}
      />
    </div>
  );
}
