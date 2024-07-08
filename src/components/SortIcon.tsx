type Props = {
  state: "up" | "down" | "both";
};
export default function SortIcon({ state }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      <img
        src="/sort-arrow.png"
        style={{
          display: "block",
          opacity: state === "down" ? "0" : undefined,
        }}
      />
      <img
        src="/sort-arrow.png"
        style={{
          display: "block",
          rotate: "180deg",
          opacity: state === "up" ? "0" : undefined,
        }}
      />
    </div>
  );
}
