import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Image, Circle } from "react-konva";
import Konva from "konva";
import useImage from "use-image";

interface ConstructionPlanKonvaProps {
  imageUrl: string;
}

export default function ConstructionPlanKonva({
  imageUrl,
}: ConstructionPlanKonvaProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const [image] = useImage(imageUrl, "anonymous");
  const [circles, setCircles] = useState<Array<any>>([
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

    // Transform the stage to apply the new scale and position
    stage.scale({ x: scale, y: scale });
    stage.position({
      x: (containerWidth - image.width * scale) / 2,
      y: (containerHeight - image.height * scale) / 2,
    });
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
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // don't add circles on drag
    if (e.target.getStage()?.isDragging()) {
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
    setCircles([
      ...circles,
      {
        x: pos.x,
        y: pos.y,
        radius: 20,
        fill: "red",
        id: Date.now().toString(),
      },
    ]);
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
      >
        <Layer>
          <Image image={image} />
        </Layer>
        <Layer>
          {circles.map((circle) => (
            <Circle
              key={circle.id}
              x={circle.x}
              y={circle.y}
              radius={circle.radius}
              fill={circle.fill}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
