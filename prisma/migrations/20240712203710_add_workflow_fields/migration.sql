/*
  Warnings:

  - Added the required column `name` to the `OrderWorkflow` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `OrderWorkflowInstance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actionType` to the `OrderWorkflowStep` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `OrderWorkflowStep` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderWorkflow" ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OrderWorkflowInstance" ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OrderWorkflowStep" ADD COLUMN     "actionMessage" TEXT,
ADD COLUMN     "actionTarget" TEXT,
ADD COLUMN     "actionType" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "proceedImmediatelyTo" TEXT;

-- CreateTable
CREATE TABLE "OrderWorkflowStepProceedListener" (
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "goto" TEXT NOT NULL,
    "stepId" INTEGER NOT NULL,

    CONSTRAINT "OrderWorkflowStepProceedListener_pkey" PRIMARY KEY ("type","from")
);

-- AddForeignKey
ALTER TABLE "OrderWorkflowStepProceedListener" ADD CONSTRAINT "OrderWorkflowStepProceedListener_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "OrderWorkflowStep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
