import { angleBetweenPoints, distance } from "@/utility/geometry";
import { Fragment } from "react";

export type Line = {
  point1: { x: number; y: number };
  point2: { x: number; y: number };
};
type Props = {
  lines: Line[];
};
export function ConnectionLines({ lines }: Props) {
  return (
    <>
      {lines.map((line) => {
        return (
          <Fragment
            key={`${line.point1.x}-${line.point1.y}-${line.point2.x}-${line.point2.y}`}
          >
            {/* "Anchor" for the line */}
            <div
              style={{
                width: "15px",
                height: "15px",
                position: "absolute",
                left: `${line.point1.x}px`,
                top: `${line.point1.y}px`,
                rotate: `${
                  angleBetweenPoints(line.point1, line.point2) + 90
                }deg`,
              }}
            >
              {/* The line */}
              <div
                style={{
                  height: `${distance(line.point1, line.point2)}px`,
                  width: "3px",
                  backgroundColor: "black",
                  position: "absolute",
                  left: "50%",
                  bottom: "50%",
                  translate: "-50% 0",
                }}
              >
                {/* The arrow */}
                <div
                  className="triangle-div-up"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    translate: "-50% -115%",
                    scale: "80% 230%",
                  }}
                ></div>
              </div>
            </div>
          </Fragment>
        );
      })}
    </>
  );
}
