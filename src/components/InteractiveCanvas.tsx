import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Image, Shape } from "react-konva";
import Konva from "konva";
import useImage from "use-image";
import type { TaskDocType } from "@/types/schemas";

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

  // Reference to parent container
  const containerRef = useRef<HTMLDivElement>(null);

  // State to track stage dimensions
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [stageTransform, setStageTransform] = useState({
    scale: 1,
    x: 0,
    y: 0,
  });

  // Function to handle resize
  const updateSize = () => {
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
    console.log({
      x: pos.x,
      y: pos.y,
      radius: 20,
      fill: "red",
      id: Date.now().toString(),
    });
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

  const handlePinClick = (
    e: Konva.KonvaEventObject<MouseEvent>,
    taskId: string
  ) => {
    if (window.confirm("Are you sure you want to delete this pin?")) {
      setTaskList((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    }
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
      style={{ width: "100%", height: "100%" }}
    >
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        draggable
        onWheel={handleWheel}
        onClick={handleStageClick}
        onDragEnd={handleDragEnd}
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
    </div>
  );
}
