import React, { useEffect, useRef, useState } from "react";
import { render } from "react-dom";
import { Stage, Layer, Rect, Text, Image, Circle } from "react-konva";
import Konva from "konva";
import useImage from "use-image";

const URLImage = ({ src, ...rest }) => {
  const [image] = useImage(src, "anonymous");
  return <Image image={image} {...rest} />;
};

interface ConstructionPlan2Props {
  imageUrl: string;
}

export default function ConstructionPlanKonva({
  imageUrl,
}: ConstructionPlan2Props) {
  const stageRef = useRef(null);
  const [circles, setCircles] = useState<Array<any>>([
    {
      x: 959.7698097033505,
      y: 366.02753430245855,
      radius: 20,
      fill: "red",
      id: "1753208688013",
    },
  ]);

  // Define virtual size for our scene
  const sceneWidth = 1000;
  const sceneHeight = 1000;
  // Reference to parent container
  const containerRef = useRef(null);

  // Function to handle resize
  const updateSize = () => {
    if (!containerRef.current) return;

    // Get container width
    const containerWidth = containerRef.current.offsetWidth;

    // Calculate scale
    const scale = containerWidth / sceneWidth;

    // Update state with new dimensions
    setStageSize({
      width: sceneWidth * scale,
      height: sceneHeight * scale,
      scale: scale,
    });
  };

  // State to track current scale and dimensions
  const [stageSize, setStageSize] = useState({
    width: sceneWidth,
    height: sceneHeight,
    scale: 1,
  });

  const handleWheel = (e) => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

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

  const handleStageClick = (e) => {
    const pos = e.target.getStage().getRelativePointerPosition();
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

  // Update on mount and when window resizes
  useEffect(() => {
    updateSize();
    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={stageSize.scale}
        scaleY={stageSize.scale}
        draggable
        onWheel={handleWheel}
        onClick={handleStageClick}
      >
        <Layer>
          <URLImage src={imageUrl} />
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
