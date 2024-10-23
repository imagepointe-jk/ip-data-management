/*
  Warnings:

  - Made the column `productSizeOptionsId` on table `CustomProductSettingsVariation` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "CustomProductSettingsVariation" DROP CONSTRAINT "CustomProductSettingsVariation_productSizeOptionsId_fkey";

-- AlterTable
ALTER TABLE "CustomProductSettingsVariation" ALTER COLUMN "productSizeOptionsId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "CustomProductSettingsVariation" ADD CONSTRAINT "CustomProductSettingsVariation_productSizeOptionsId_fkey" FOREIGN KEY ("productSizeOptionsId") REFERENCES "ProductSizeOptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
