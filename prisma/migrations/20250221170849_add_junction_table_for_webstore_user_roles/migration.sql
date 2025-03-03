/*
  Warnings:

  - You are about to drop the column `isApprover` on the `OrderWorkflowUser` table. All the data in the column will be lost.
  - You are about to drop the `_OrderWorkflowUserToWebstore` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_OrderWorkflowUserToWebstore" DROP CONSTRAINT "_OrderWorkflowUserToWebstore_A_fkey";

-- DropForeignKey
ALTER TABLE "_OrderWorkflowUserToWebstore" DROP CONSTRAINT "_OrderWorkflowUserToWebstore_B_fkey";

-- AlterTable
ALTER TABLE "OrderWorkflowUser" DROP COLUMN "isApprover";

-- DropTable
DROP TABLE "_OrderWorkflowUserToWebstore";

-- CreateTable
CREATE TABLE "OrderWorkflowWebstoreUserRole" (
    "userId" INTEGER NOT NULL,
    "webstoreId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "OrderWorkflowWebstoreUserRole_pkey" PRIMARY KEY ("userId","webstoreId")
);

-- AddForeignKey
ALTER TABLE "OrderWorkflowWebstoreUserRole" ADD CONSTRAINT "OrderWorkflowWebstoreUserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "OrderWorkflowUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderWorkflowWebstoreUserRole" ADD CONSTRAINT "OrderWorkflowWebstoreUserRole_webstoreId_fkey" FOREIGN KEY ("webstoreId") REFERENCES "Webstore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
