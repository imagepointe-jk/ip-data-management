-- CreateTable
CREATE TABLE "WebstoreUserRole" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'New Role',
    "webstoreId" INTEGER NOT NULL,

    CONSTRAINT "WebstoreUserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_OrderWorkflowUserToWebstoreUserRole" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_OrderWorkflowUserToWebstoreUserRole_AB_unique" ON "_OrderWorkflowUserToWebstoreUserRole"("A", "B");

-- CreateIndex
CREATE INDEX "_OrderWorkflowUserToWebstoreUserRole_B_index" ON "_OrderWorkflowUserToWebstoreUserRole"("B");

-- AddForeignKey
ALTER TABLE "WebstoreUserRole" ADD CONSTRAINT "WebstoreUserRole_webstoreId_fkey" FOREIGN KEY ("webstoreId") REFERENCES "Webstore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderWorkflowUserToWebstoreUserRole" ADD CONSTRAINT "_OrderWorkflowUserToWebstoreUserRole_A_fkey" FOREIGN KEY ("A") REFERENCES "OrderWorkflowUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderWorkflowUserToWebstoreUserRole" ADD CONSTRAINT "_OrderWorkflowUserToWebstoreUserRole_B_fkey" FOREIGN KEY ("B") REFERENCES "WebstoreUserRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;
