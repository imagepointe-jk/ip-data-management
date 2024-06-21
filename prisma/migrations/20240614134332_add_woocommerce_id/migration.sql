/*
  Warnings:

  - Added the required column `wooCommerceId` to the `CustomGarmentSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CustomGarmentSettings" ADD COLUMN     "wooCommerceId" INTEGER NOT NULL;
