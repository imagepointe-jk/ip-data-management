/*
  Warnings:

  - Added the required column `url` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "url" TEXT NOT NULL;
