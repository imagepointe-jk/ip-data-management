"use client";

import { DraggableDiv } from "@/components/DraggableDiv/DraggableDiv";

export default function Page() {
  return (
    <>
      <h1>Test</h1>
      <div
        style={{
          position: "relative",
          border: "1px solid black",
          height: "1000px",
        }}
      >
        <DraggableDiv
          contentContainerStyle={{ backgroundColor: "gray", padding: "10px" }}
          dragBarChildren={<>Step 0</>}
          dragBarStyle={{ backgroundColor: "lightgray", padding: "10px" }}
          onDragFinish={(position) => console.log(position)}
        >
          <p>Test div</p>
          <div>
            <input type="text" />
          </div>
        </DraggableDiv>
      </div>
    </>
  );
}
