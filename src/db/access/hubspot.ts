import { AppError } from "@/error";
import { prisma } from "../../../prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export async function createHubSpotSync(userEmail: string) {
  const user = await prisma.user.findUnique({
    where: {
      email: userEmail,
    },
  });
  if (!user)
    throw new AppError({
      type: "Unknown",
    });

  return prisma.hubSpotSync.create({
    data: {
      startedById: user.id,
      progress: 0,
      startedAt: new Date(),
    },
  });
}

export async function updateHubSpotSyncProgress(
  syncId: number,
  progress: number
) {
  if (progress < 0 || progress > 1)
    throw new AppError({
      type: "Database",
      serverMessage: `HubSpotSync progress must be in the range 0-1 (input was ${progress})`,
    });
  return prisma.hubSpotSync.update({
    where: {
      id: syncId,
    },
    data: {
      progress,
    },
  });
}

export async function completeHubSpotSync(syncId: number) {
  return prisma.hubSpotSync.update({
    where: {
      id: syncId,
    },
    data: {
      progress: 1,
      finishedAt: new Date(),
    },
  });
}

export async function getCurrentHubSpotSyncProgress() {
  const resultArray = await prisma.hubSpotSync.findMany({
    orderBy: {
      startedAt: "desc",
    },
    take: 1,
  });
  const mostRecent = resultArray[0];

  if (!mostRecent || mostRecent.progress.equals(new Decimal(1))) return null;
  return mostRecent.progress.toNumber();
}
