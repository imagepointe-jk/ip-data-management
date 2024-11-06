-- AlterTable
ALTER TABLE "Webstore" ADD COLUMN     "customOrderApprovedEmail" TEXT,
ADD COLUMN     "useCustomOrderApprovedEmail" BOOLEAN NOT NULL DEFAULT false;
