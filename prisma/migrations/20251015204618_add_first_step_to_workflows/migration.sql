/*
  Warnings:

  - A unique constraint covering the columns `[firstStepInId]` on the table `OrderWorkflowStep` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "OrderWorkflowStep" ADD COLUMN     "firstStepInId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "OrderWorkflowStep_firstStepInId_key" ON "OrderWorkflowStep"("firstStepInId");

-- AddForeignKey
ALTER TABLE "OrderWorkflowStep" ADD CONSTRAINT "OrderWorkflowStep_firstStepInId_fkey" FOREIGN KEY ("firstStepInId") REFERENCES "OrderWorkflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;
