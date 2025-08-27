-- DropForeignKey
ALTER TABLE "WebstoreShippingSettings" DROP CONSTRAINT "WebstoreShippingSettings_webstoreId_fkey";

-- AddForeignKey
ALTER TABLE "WebstoreShippingSettings" ADD CONSTRAINT "WebstoreShippingSettings_webstoreId_fkey" FOREIGN KEY ("webstoreId") REFERENCES "Webstore"("id") ON DELETE CASCADE ON UPDATE CASCADE;
