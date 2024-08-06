-- DropForeignKey
ALTER TABLE "OrderWorkflowStepProceedListener" DROP CONSTRAINT "OrderWorkflowStepProceedListener_stepId_fkey";

-- AddForeignKey
ALTER TABLE "OrderWorkflowStepProceedListener" ADD CONSTRAINT "OrderWorkflowStepProceedListener_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "OrderWorkflowStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;
