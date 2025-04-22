/*
  Warnings:

  - You are about to drop the `OrderWorkflowWebstoreUserRole` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrderWorkflowWebstoreUserRole" DROP CONSTRAINT "OrderWorkflowWebstoreUserRole_userId_fkey";

-- DropForeignKey
ALTER TABLE "OrderWorkflowWebstoreUserRole" DROP CONSTRAINT "OrderWorkflowWebstoreUserRole_webstoreId_fkey";

-- DropTable
DROP TABLE "OrderWorkflowWebstoreUserRole";
