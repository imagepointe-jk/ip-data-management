-- DropForeignKey
ALTER TABLE "OrderWorkflowUser" DROP CONSTRAINT "OrderWorkflowUser_webstoreId_fkey";

-- CreateTable
CREATE TABLE "_OrderWorkflowUserToWebstore" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_OrderWorkflowUserToWebstore_AB_unique" ON "_OrderWorkflowUserToWebstore"("A", "B");

-- CreateIndex
CREATE INDEX "_OrderWorkflowUserToWebstore_B_index" ON "_OrderWorkflowUserToWebstore"("B");

-- AddForeignKey
ALTER TABLE "_OrderWorkflowUserToWebstore" ADD CONSTRAINT "_OrderWorkflowUserToWebstore_A_fkey" FOREIGN KEY ("A") REFERENCES "OrderWorkflowUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderWorkflowUserToWebstore" ADD CONSTRAINT "_OrderWorkflowUserToWebstore_B_fkey" FOREIGN KEY ("B") REFERENCES "Webstore"("id") ON DELETE CASCADE ON UPDATE CASCADE;
