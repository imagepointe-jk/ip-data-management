/*
  Warnings:

  - You are about to drop the column `allowApproverChangeCarrier` on the `WebstoreShippingSettings` table. All the data in the column will be lost.
  - Added the required column `allowUpsToCanada` to the `WebstoreShippingSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WebstoreShippingSettings" DROP COLUMN "allowApproverChangeCarrier",
ADD COLUMN     "allowUpsToCanada" BOOLEAN NOT NULL;
