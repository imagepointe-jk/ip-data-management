-- DropForeignKey
ALTER TABLE "WebstoreCheckoutField" DROP CONSTRAINT "WebstoreCheckoutField_webstoreId_fkey";

-- AddForeignKey
ALTER TABLE "WebstoreCheckoutField" ADD CONSTRAINT "WebstoreCheckoutField_webstoreId_fkey" FOREIGN KEY ("webstoreId") REFERENCES "Webstore"("id") ON DELETE CASCADE ON UPDATE CASCADE;
