/*
  Warnings:

  - Added the required column `name` to the `CustomGarmentView` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CustomGarmentView" ADD COLUMN     "name" TEXT NOT NULL;
