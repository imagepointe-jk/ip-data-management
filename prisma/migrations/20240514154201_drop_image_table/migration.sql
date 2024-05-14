/*
  Warnings:

  - You are about to drop the column `imageId` on the `Design` table. All the data in the column will be lost.
  - You are about to drop the `Image` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Design" DROP CONSTRAINT "Design_imageId_fkey";

-- AlterTable
ALTER TABLE "Design" DROP COLUMN "imageId";

-- DropTable
DROP TABLE "Image";
