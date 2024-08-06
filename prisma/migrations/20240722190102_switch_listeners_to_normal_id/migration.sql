/*
  Warnings:

  - The primary key for the `OrderWorkflowStepProceedListener` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "OrderWorkflowStepProceedListener" DROP CONSTRAINT "OrderWorkflowStepProceedListener_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "OrderWorkflowStepProceedListener_pkey" PRIMARY KEY ("id");
