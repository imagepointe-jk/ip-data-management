import Konva from "konva";
import { ReactNode, useEffect, useRef } from "react";
import { Group, Transformer } from "react-konva";

type Props = {
  children: ReactNode;
  selected?: boolean;
};
export function Transformable({ children, selected }: Props) {
  const mainRef = useRef<Konva.Group>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (!selected) return;

    const transformer = transformerRef.current;
    const main = mainRef.current;
    if (!transformer || !main) return;

    //this is very sketchy but it seems to work!
    //@ts-ignore
    transformer.nodes([main.children[0]]);
    transformer.getLayer()?.batchDraw();
  }, [selected]);

  return (
    <>
      <Group ref={mainRef} draggable>
        {children}
      </Group>
      {selected && <Transformer ref={transformerRef} />}
    </>
  );
}
