-- AlterTable
ALTER TABLE "OrderWorkflowInstance" ADD COLUMN     "purchaserEmail" TEXT NOT NULL DEFAULT 'No Email',
ADD COLUMN     "purchaserName" TEXT NOT NULL DEFAULT 'No Name';
