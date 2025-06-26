import { prisma } from "@/prisma";
import { EditColors } from "./EditColors";

export default async function Page() {
  const colors = await prisma.color.findMany();

  return (
    <>
      <h1>Manage Colors</h1>
      <EditColors colors={colors} />
    </>
  );
}
