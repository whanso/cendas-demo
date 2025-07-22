import { Stage, Layer, Image } from "react-konva";
import useImage from "use-image";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

// const URLImage = ({ src, ...rest }) => {
//   const [image] = useImage(src, "anonymous");
//   return <Image image={image} {...rest} />;
// };

export default function ConstructionPlan() {
  return (
    <TransformWrapper>
      <TransformComponent>
        <img src="image.png" alt="test" />
      </TransformComponent>
    </TransformWrapper>
  );
}
