/*
  Warnings:

  - Added the required column `apiKeyEncryptIv` to the `Webstore` table without a default value. This is not possible if the table is not empty.
  - Added the required column `apiKeyEncryptTag` to the `Webstore` table without a default value. This is not possible if the table is not empty.
  - Added the required column `apiSecretEncryptIv` to the `Webstore` table without a default value. This is not possible if the table is not empty.
  - Added the required column `apiSecretEncryptTag` to the `Webstore` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Webstore" ADD COLUMN     "apiKeyEncryptIv" TEXT NOT NULL,
ADD COLUMN     "apiKeyEncryptTag" TEXT NOT NULL,
ADD COLUMN     "apiSecretEncryptIv" TEXT NOT NULL,
ADD COLUMN     "apiSecretEncryptTag" TEXT NOT NULL;
