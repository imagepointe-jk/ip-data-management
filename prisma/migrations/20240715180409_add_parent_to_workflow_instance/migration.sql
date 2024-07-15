/*
  Warnings:

  - Added the required column `parentWorkflowId` to the `OrderWorkflowInstance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderWorkflowInstance" ADD COLUMN     "parentWorkflowId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "OrderWorkflowInstance" ADD CONSTRAINT "OrderWorkflowInstance_parentWorkflowId_fkey" FOREIGN KEY ("parentWorkflowId") REFERENCES "OrderWorkflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
