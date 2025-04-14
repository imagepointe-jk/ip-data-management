-- AlterTable
ALTER TABLE "OrderWorkflowInstance" ADD COLUMN     "approvedByUserId" INTEGER,
ADD COLUMN     "deniedByUserId" INTEGER;

-- AddForeignKey
ALTER TABLE "OrderWorkflowInstance" ADD CONSTRAINT "OrderWorkflowInstance_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "OrderWorkflowUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderWorkflowInstance" ADD CONSTRAINT "OrderWorkflowInstance_deniedByUserId_fkey" FOREIGN KEY ("deniedByUserId") REFERENCES "OrderWorkflowUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
