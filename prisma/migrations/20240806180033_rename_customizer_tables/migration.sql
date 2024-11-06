/*
  Warnings:

  - You are about to drop the `CustomGarmentDecorationLocation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CustomGarmentSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CustomGarmentSettingsVariation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CustomGarmentView` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CustomGarmentDecorationLocation" DROP CONSTRAINT "CustomGarmentDecorationLocation_parentViewId_fkey";

-- DropForeignKey
ALTER TABLE "CustomGarmentSettingsVariation" DROP CONSTRAINT "CustomGarmentSettingsVariation_colorId_fkey";

-- DropForeignKey
ALTER TABLE "CustomGarmentSettingsVariation" DROP CONSTRAINT "CustomGarmentSettingsVariation_parentSettingsId_fkey";

-- DropForeignKey
ALTER TABLE "CustomGarmentView" DROP CONSTRAINT "CustomGarmentView_parentVariationId_fkey";

-- DropTable
DROP TABLE "CustomGarmentDecorationLocation";

-- DropTable
DROP TABLE "CustomGarmentSettings";

-- DropTable
DROP TABLE "CustomGarmentSettingsVariation";

-- DropTable
DROP TABLE "CustomGarmentView";

-- CreateTable
CREATE TABLE "CustomProductSettings" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "wooCommerceId" INTEGER NOT NULL,

    CONSTRAINT "CustomProductSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomProductSettingsVariation" (
    "id" SERIAL NOT NULL,
    "parentSettingsId" INTEGER NOT NULL,
    "colorId" INTEGER NOT NULL,

    CONSTRAINT "CustomProductSettingsVariation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomProductView" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "parentVariationId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "CustomProductView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomProductDecorationLocation" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "positionX" DECIMAL(65,30) NOT NULL,
    "positionY" DECIMAL(65,30) NOT NULL,
    "width" DECIMAL(65,30) NOT NULL,
    "height" DECIMAL(65,30) NOT NULL,
    "parentViewId" INTEGER NOT NULL,

    CONSTRAINT "CustomProductDecorationLocation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CustomProductSettingsVariation" ADD CONSTRAINT "CustomProductSettingsVariation_parentSettingsId_fkey" FOREIGN KEY ("parentSettingsId") REFERENCES "CustomProductSettings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomProductSettingsVariation" ADD CONSTRAINT "CustomProductSettingsVariation_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomProductView" ADD CONSTRAINT "CustomProductView_parentVariationId_fkey" FOREIGN KEY ("parentVariationId") REFERENCES "CustomProductSettingsVariation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomProductDecorationLocation" ADD CONSTRAINT "CustomProductDecorationLocation_parentViewId_fkey" FOREIGN KEY ("parentViewId") REFERENCES "CustomProductView"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
