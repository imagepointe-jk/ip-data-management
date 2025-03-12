-- CreateTable
CREATE TABLE "WebstoreCheckoutField" (
    "id" SERIAL NOT NULL,
    "webstoreId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "options" TEXT,

    CONSTRAINT "WebstoreCheckoutField_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WebstoreCheckoutField" ADD CONSTRAINT "WebstoreCheckoutField_webstoreId_fkey" FOREIGN KEY ("webstoreId") REFERENCES "Webstore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
