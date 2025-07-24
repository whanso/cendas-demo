import { useCallback, useEffect, useRef, useState } from "react";
import { Stage, Layer, Image, Shape } from "react-konva";
import Konva from "konva";
import useImage from "use-image";
import type { TaskDocType } from "@/types/schemas";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ConstructionPlanKonvaProps {
  imageUrl: string;
  tasks?: Array<TaskDocType>;
  pinColor?: string;
}

export default function InteractiveCanvas({
  imageUrl,
}: ConstructionPlanKonvaProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const [image] = useImage(imageUrl, "anonymous");
  const [taskList, setTaskList] = useState<Array<any>>([
    {
      x: 959.7698097033505,
      y: 366.02753430245855,
      radius: 20,
      fill: "red",
      id: "1753208688013",
    },
  ]);
  const [lastCenter, setLastCenter] = useState<{ x: number; y: number } | null>(
    null
  );
  const [lastDist, setLastDist] = useState(0);
  const [dragStopped, setDragStopped] = useState(false);
  // const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  // Reference to parent container
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Function to handle resize
  const updateSize = () => {
    console.log("updatesize");
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
  };

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
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
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

    // Don't add a pin on drag.
    if (e.target.isDragging()) {
      return;
    }
    const pos = e.target.getStage()?.getRelativePointerPosition();
    if (!pos) return;
    // Add new circle
    setTaskList([
      ...taskList,
      {
        x: pos.x,
        y: pos.y,
        radius: 20,
        fill: "red",
        id: Date.now().toString(),
      },
    ]);
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

  const handleTouchMove = useCallback(
    (e: Konva.KonvaEventObject<TouchEvent>) => {
      e.evt.preventDefault();
      const touch1 = e.evt.touches[0];
      const touch2 = e.evt.touches[1];
      const stage = e.target.getStage();

      if (!stage) return;

      // we need to restore dragging, if it was cancelled by multi-touch
      if (touch1 && !touch2 && !stage.isDragging() && dragStopped) {
        stage.startDrag();
        setDragStopped(false);
      }

      if (touch1 && touch2) {
        // if the stage was under Konva's drag&drop
        // we need to stop it, and implement our own pan logic with two pointers
        if (stage.isDragging()) {
          stage.stopDrag();
          setDragStopped(true);
        }

        const p1 = {
          x: touch1.clientX,
          y: touch1.clientY,
        };
        const p2 = {
          x: touch2.clientX,
          y: touch2.clientY,
        };

        if (!lastCenter) {
          setLastCenter(getCenter(p1, p2));
          return;
        }
        const newCenter = getCenter(p1, p2);

        const dist = getDistance(p1, p2);

        if (!lastDist) {
          setLastDist(dist);
          return;
        }

        const pos = e.target.getStage()?.getRelativePointerPosition();
        if (!pos) return;

        // local coordinates of center point
        const pointTo = {
          x: (newCenter.x - pos.x) / stage.scaleX(),
          y: (newCenter.y - pos.y) / stage.scaleX(),
        };

        const scale = stage.scaleX() * (dist / lastDist);

        stage.scale({ x: scale, y: scale });

        // calculate new position of the stage
        const dx = newCenter.x - lastCenter.x;
        const dy = newCenter.y - lastCenter.y;

        stage.position({
          x: newCenter.x - pointTo.x * scale + dx,
          y: newCenter.y - pointTo.y * scale + dy,
        });

        setLastDist(dist);
        setLastCenter(newCenter);
      }
    },
    [dragStopped, lastCenter, lastDist]
  );

  const handleTouchEnd = () => {
    setLastDist(0);
    setLastCenter(null);
  };

  const handlePinClick = (
    e: Konva.KonvaEventObject<MouseEvent | Event>,
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
    setTaskList((prevTasks) =>
      prevTasks.filter((task) => task.id !== contextMenu.taskId)
    );
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    setStageTransform({
      ...stageTransform,
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  // Update on mount, when window resizes, or when image loads
  useEffect(() => {
    updateSize();
    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, [image]);

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
        onDragEnd={handleDragEnd}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Layer>
          <Image image={image} />
        </Layer>
        <Layer>
          {taskList.map((task) => (
            <Shape
              key={task.id}
              x={task.x}
              y={task.y}
              width={30}
              height={45}
              offsetX={30 / 2}
              offsetY={45}
              scaleX={1 / stageTransform.scale}
              scaleY={1 / stageTransform.scale}
              onClick={(e) => handlePinClick(e, task.id)}
              onTap={(e) => handlePinClick(e, task.id)}
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
                const text = "AB";
                context.font = "bold 13px Arial";
                context.fillStyle = "white";
                context.textAlign = "center";
                context.textBaseline = "middle";
                // Position text in the center of the circular part of the pin
                context.fillText(text, radius, radius);
              }}
              fill="#E53E3E" // A classic red for a pin
              stroke="black"
              strokeWidth={2}
              draggable
            />
          ))}
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
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem className="text-red-500" onClick={handleDeletePin}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
