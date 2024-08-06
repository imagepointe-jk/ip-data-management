/*
  Warnings:

  - You are about to drop the column `organizationId` on the `OrderWorkflow` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `OrderWorkflowUser` table. All the data in the column will be lost.
  - You are about to drop the `Organization` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `webstoreId` to the `OrderWorkflow` table without a default value. This is not possible if the table is not empty.
  - Added the required column `webstoreId` to the `OrderWorkflowUser` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OrderWorkflow" DROP CONSTRAINT "OrderWorkflow_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OrderWorkflowUser" DROP CONSTRAINT "OrderWorkflowUser_organizationId_fkey";

-- AlterTable
ALTER TABLE "OrderWorkflow" DROP COLUMN "organizationId",
ADD COLUMN     "webstoreId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "OrderWorkflowUser" DROP COLUMN "organizationId",
ADD COLUMN     "webstoreId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Organization";

-- CreateTable
CREATE TABLE "Webstore" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "apiSecret" TEXT NOT NULL,

    CONSTRAINT "Webstore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Webstore_url_key" ON "Webstore"("url");

-- AddForeignKey
ALTER TABLE "OrderWorkflow" ADD CONSTRAINT "OrderWorkflow_webstoreId_fkey" FOREIGN KEY ("webstoreId") REFERENCES "Webstore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderWorkflowUser" ADD CONSTRAINT "OrderWorkflowUser_webstoreId_fkey" FOREIGN KEY ("webstoreId") REFERENCES "Webstore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
