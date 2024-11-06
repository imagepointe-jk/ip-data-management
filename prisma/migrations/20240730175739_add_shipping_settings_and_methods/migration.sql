-- CreateTable
CREATE TABLE "WebstoreShippingSettings" (
    "id" SERIAL NOT NULL,
    "allowApproverChangeCarrier" BOOLEAN NOT NULL,
    "allowApproverChangeMethod" BOOLEAN NOT NULL,
    "webstoreId" INTEGER NOT NULL,

    CONSTRAINT "WebstoreShippingSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebstoreShippingMethod" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "serviceCode" INTEGER,

    CONSTRAINT "WebstoreShippingMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_WebstoreToWebstoreShippingMethod" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "WebstoreShippingSettings_webstoreId_key" ON "WebstoreShippingSettings"("webstoreId");

-- CreateIndex
CREATE UNIQUE INDEX "_WebstoreToWebstoreShippingMethod_AB_unique" ON "_WebstoreToWebstoreShippingMethod"("A", "B");

-- CreateIndex
CREATE INDEX "_WebstoreToWebstoreShippingMethod_B_index" ON "_WebstoreToWebstoreShippingMethod"("B");

-- AddForeignKey
ALTER TABLE "WebstoreShippingSettings" ADD CONSTRAINT "WebstoreShippingSettings_webstoreId_fkey" FOREIGN KEY ("webstoreId") REFERENCES "Webstore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WebstoreToWebstoreShippingMethod" ADD CONSTRAINT "_WebstoreToWebstoreShippingMethod_A_fkey" FOREIGN KEY ("A") REFERENCES "Webstore"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WebstoreToWebstoreShippingMethod" ADD CONSTRAINT "_WebstoreToWebstoreShippingMethod_B_fkey" FOREIGN KEY ("B") REFERENCES "WebstoreShippingMethod"("id") ON DELETE CASCADE ON UPDATE CASCADE;
