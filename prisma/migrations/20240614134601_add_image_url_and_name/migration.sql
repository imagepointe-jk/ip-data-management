/*
  Warnings:

  - Added the required column `name` to the `CustomGarmentDecorationLocation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageUrl` to the `CustomGarmentView` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CustomGarmentDecorationLocation" ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CustomGarmentView" ADD COLUMN     "imageUrl" TEXT NOT NULL;
