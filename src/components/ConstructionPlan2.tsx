import useImage from "use-image";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useLayoutEffect, useRef, useState } from "react";

interface ConstructionPlan2Props {
  imageUrl: string;
}

export default function ConstructionPlan2({
  imageUrl,
}: ConstructionPlan2Props) {
  const [image] = useImage(imageUrl, "anonymous");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [initialScale, setInitialScale] = useState<number | undefined>();
  
  useLayoutEffect(() => {
    if (image && canvasRef.current && containerRef.current) {
      // Draw image on canvas
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0);
      }

      // Calculate initial scale to fit image in container.
      // This effect should only run once when the image is loaded.
      const { clientWidth, clientHeight } = containerRef.current;
      const { width: imageWidth, height: imageHeight } = image;

      if (imageWidth > 0 && imageHeight > 0) {
        const scaleX = clientWidth / imageWidth;
        const scaleY = clientHeight / imageHeight;
        const newScale = Math.min(scaleX, scaleY);
        setInitialScale(newScale);
      }
    }
  }, [image]);

  return (
    <div
      ref={containerRef}
      className="flex-grow flex items-center justify-center overflow-hidden p-4"
      // Hide the container until the scale is calculated to prevent a flash
      style={{ visibility: initialScale ? "visible" : "hidden" }}
    >
      <TransformWrapper
        key={initialScale?.toString()} // Force re-initialization when scale is ready
        initialScale={initialScale}
        centerOnInit={true}
        limitToBounds={true}
      >
        <TransformComponent
          wrapperStyle={{ width: "100%", height: "100%" }}
        >
          <canvas ref={canvasRef} />
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
