/*
  Warnings:

  - Added the required column `order` to the `OrderWorkflowStep` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderWorkflowStep" ADD COLUMN     "order" INTEGER NOT NULL;
