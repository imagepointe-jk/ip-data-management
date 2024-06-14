/*
  Warnings:

  - You are about to drop the column `colorId` on the `CustomGarmentSettings` table. All the data in the column will be lost.
  - Added the required column `colorId` to the `CustomGarmentSettingsVariation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CustomGarmentSettings" DROP CONSTRAINT "CustomGarmentSettings_colorId_fkey";

-- AlterTable
ALTER TABLE "CustomGarmentSettings" DROP COLUMN "colorId";

-- AlterTable
ALTER TABLE "CustomGarmentSettingsVariation" ADD COLUMN     "colorId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "CustomGarmentSettingsVariation" ADD CONSTRAINT "CustomGarmentSettingsVariation_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
