-- AlterTable
ALTER TABLE "OrderWorkflowInstance" ADD COLUMN     "activeStepId" INTEGER;

-- AlterTable
ALTER TABLE "OrderWorkflowStep" ADD COLUMN     "proceedImmediatelyToStepId" INTEGER;

-- AlterTable
ALTER TABLE "OrderWorkflowStepProceedListener" ADD COLUMN     "goToStepId" INTEGER;

-- AddForeignKey
ALTER TABLE "OrderWorkflowStep" ADD CONSTRAINT "OrderWorkflowStep_proceedImmediatelyToStepId_fkey" FOREIGN KEY ("proceedImmediatelyToStepId") REFERENCES "OrderWorkflowStep"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderWorkflowStepProceedListener" ADD CONSTRAINT "OrderWorkflowStepProceedListener_goToStepId_fkey" FOREIGN KEY ("goToStepId") REFERENCES "OrderWorkflowStep"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderWorkflowInstance" ADD CONSTRAINT "OrderWorkflowInstance_activeStepId_fkey" FOREIGN KEY ("activeStepId") REFERENCES "OrderWorkflowStep"("id") ON DELETE SET NULL ON UPDATE CASCADE;
