import Konva from "konva";
import { ReactNode, useEffect, useRef } from "react";
import { Group, Transformer } from "react-konva";

type Props = {
  children: ReactNode;
};
export function Transformable({ children }: Props) {
  const mainRef = useRef<Konva.Group>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    const transformer = transformerRef.current;
    const main = mainRef.current;
    if (!transformer || !main) return;

    transformer.nodes([main]);
    transformer.getLayer()?.batchDraw();
  }, []);

  return (
    <>
      <Group ref={mainRef} draggable>
        {children}
      </Group>
      <Transformer ref={transformerRef} />
    </>
  );
}
