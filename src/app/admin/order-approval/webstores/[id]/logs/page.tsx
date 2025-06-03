import { prisma } from "@/prisma";
import { notFound } from "next/navigation";
import { NextSearchParams } from "@/types/schema/misc";
import { ResultsExplorer } from "./ResultsExplorer";

export const PAGE_SIZE = 20;
type Props = {
  params: Promise<{
    id: string;
  }>;
  searchParams: NextSearchParams;
};
export default async function Page({ params, searchParams }: Props) {
  const webstoreId = +(await params).id;
  const webstore = await prisma.webstore.findUnique({
    where: {
      id: webstoreId,
    },
  });
  if (!webstore) notFound();

  const search = await searchParams;
  const page = isNaN(+`${search.page}`) ? 1 : +`${search.page}`;
  const [filteredLogs, allLogs] = await prisma.$transaction([
    prisma.webstoreLog.findMany({
      where: {
        webstoreId,
        text: {
          contains: search.search ? `${search.search}` : undefined,
        },
        severity: {
          mode: "insensitive",
          equals: search.severity ? `${search.severity}` : undefined,
        },
      },
      take: PAGE_SIZE,
      skip: PAGE_SIZE * (page - 1),
      orderBy: {
        createdAt: search.sortDirection === "asc" ? "asc" : "desc",
      },
    }),
    prisma.webstoreLog.findMany(),
  ]);

  return (
    <>
      <h1>Logs for {webstore.name}</h1>
      <ResultsExplorer logs={filteredLogs} totalLogs={allLogs.length} />
    </>
  );
}
