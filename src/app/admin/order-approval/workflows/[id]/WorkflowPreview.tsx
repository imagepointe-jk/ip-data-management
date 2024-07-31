"use client";

type Props = {
  steps: { id: number; name: string; order: number }[];
};
export function WorkflowPreview({ steps }: Props) {
  const sorted = [...steps];
  sorted.sort((a, b) => a.order - b.order);
  return (
    <div
      style={{
        position: "fixed",
        right: "0",
        top: "50%",
        backgroundColor: "lightgray",
        padding: "20px",
      }}
    >
      Workflow Preview WIP
      <ul>
        {sorted.map((step) => (
          <li key={step.id}>{step.name}</li>
        ))}
      </ul>
    </div>
  );
}
