"use client";

import {
  CSSProperties,
  MouseEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

type Vector2 = {
  x: number;
  y: number;
};
type Props = {
  initialPosition?: Vector2;
  style?: CSSProperties;
  className?: string;
  contentContainerStyle?: CSSProperties;
  contentContainerClassName?: string;
  dragBarStyle?: CSSProperties;
  dragBarClassName?: string;
  children?: ReactNode;
  dragBarChildren?: ReactNode;
  onDragFinish?: (position: Vector2) => void;
};
export function DraggableDiv({
  children,
  initialPosition,
  style,
  className,
  contentContainerClassName,
  contentContainerStyle,
  dragBarChildren,
  dragBarClassName,
  dragBarStyle,
  onDragFinish,
}: Props) {
  const mainRef = useRef<HTMLDivElement | null>(null);
  const dragBarRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<Vector2>(
    initialPosition || { x: 0, y: 0 }
  );
  const positionRef = useRef<Vector2>({ x: 0, y: 0 }); //managed alongside position; stores the most recent value of position so it can be used in callbacks in onMouseUp
  const [dragging, setDragging] = useState(false);
  const prevMousePos = useRef<Vector2>({ x: 0, y: 0 }); //using ref because prevMousePos should not trigger re-renders

  function onMouseDown(e: MouseEvent<HTMLDivElement>) {
    prevMousePos.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
  }

  useEffect(() => {
    function onMouseMove(
      e: MouseEvent<HTMLDivElement> | globalThis.MouseEvent
    ) {
      if (!dragging) return;

      const mouseDeltaX = e.clientX - prevMousePos.current.x;
      const mouseDeltaY = e.clientY - prevMousePos.current.y;

      setPosition((prev) => {
        const next = {
          x: prev.x + mouseDeltaX,
          y: prev.y + mouseDeltaY,
        };
        positionRef.current = next;
        return next;
      });
      prevMousePos.current = { x: e.clientX, y: e.clientY };
    }

    function onMouseUp() {
      setDragging(false);
      if (onDragFinish)
        onDragFinish({ x: positionRef.current.x, y: positionRef.current.y });
    }

    if (dragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging]);

  return (
    <div
      ref={mainRef}
      className={className}
      style={{
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
        ...style,
      }}
    >
      <div
        ref={dragBarRef}
        className={dragBarClassName}
        onMouseDown={onMouseDown}
        style={{ cursor: "move", userSelect: "none", ...dragBarStyle }}
      >
        {dragBarChildren}
      </div>
      <div className={contentContainerClassName} style={contentContainerStyle}>
        {children}
      </div>
    </div>
  );
}
