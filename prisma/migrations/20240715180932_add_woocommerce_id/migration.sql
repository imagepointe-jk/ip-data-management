/*
  Warnings:

  - A unique constraint covering the columns `[wooCommerceOrderId]` on the table `OrderWorkflowInstance` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `wooCommerceOrderId` to the `OrderWorkflowInstance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderWorkflowInstance" ADD COLUMN     "wooCommerceOrderId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "OrderWorkflowInstance_wooCommerceOrderId_key" ON "OrderWorkflowInstance"("wooCommerceOrderId");
