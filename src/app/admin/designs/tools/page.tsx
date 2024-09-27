import { Delete } from "./Delete";
import { Export } from "./Export";
import { Import } from "./Import";

export default function Page() {
  return (
    <>
      <h1>Tools</h1>
      <div className="vert-flex-group">
        <Export />
        <Import />
        <Delete />
      </div>
    </>
  );
}
