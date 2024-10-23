/*
  Warnings:

  - You are about to drop the column `customProductSettingsVariationId` on the `ProductSizeOptions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[productSizeOptionsId]` on the table `CustomProductSettingsVariation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ProductSizeOptions" DROP CONSTRAINT "ProductSizeOptions_customProductSettingsVariationId_fkey";

-- DropIndex
DROP INDEX "ProductSizeOptions_customProductSettingsVariationId_key";

-- AlterTable
ALTER TABLE "CustomProductSettingsVariation" ADD COLUMN     "productSizeOptionsId" INTEGER;

-- AlterTable
ALTER TABLE "ProductSizeOptions" DROP COLUMN "customProductSettingsVariationId";

-- CreateIndex
CREATE UNIQUE INDEX "CustomProductSettingsVariation_productSizeOptionsId_key" ON "CustomProductSettingsVariation"("productSizeOptionsId");

-- AddForeignKey
ALTER TABLE "CustomProductSettingsVariation" ADD CONSTRAINT "CustomProductSettingsVariation_productSizeOptionsId_fkey" FOREIGN KEY ("productSizeOptionsId") REFERENCES "ProductSizeOptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
