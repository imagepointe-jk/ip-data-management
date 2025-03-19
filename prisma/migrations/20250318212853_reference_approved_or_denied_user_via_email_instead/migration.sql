/*
  Warnings:

  - You are about to drop the column `approvedByUserId` on the `OrderWorkflowInstance` table. All the data in the column will be lost.
  - You are about to drop the column `deniedByUserId` on the `OrderWorkflowInstance` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrderWorkflowInstance" DROP CONSTRAINT "OrderWorkflowInstance_approvedByUserId_fkey";

-- DropForeignKey
ALTER TABLE "OrderWorkflowInstance" DROP CONSTRAINT "OrderWorkflowInstance_deniedByUserId_fkey";

-- AlterTable
ALTER TABLE "OrderWorkflowInstance" DROP COLUMN "approvedByUserId",
DROP COLUMN "deniedByUserId",
ADD COLUMN     "approvedByUserEmail" TEXT,
ADD COLUMN     "deniedByUserEmail" TEXT;

-- AddForeignKey
ALTER TABLE "OrderWorkflowInstance" ADD CONSTRAINT "OrderWorkflowInstance_approvedByUserEmail_fkey" FOREIGN KEY ("approvedByUserEmail") REFERENCES "OrderWorkflowUser"("email") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderWorkflowInstance" ADD CONSTRAINT "OrderWorkflowInstance_deniedByUserEmail_fkey" FOREIGN KEY ("deniedByUserEmail") REFERENCES "OrderWorkflowUser"("email") ON DELETE SET NULL ON UPDATE CASCADE;
