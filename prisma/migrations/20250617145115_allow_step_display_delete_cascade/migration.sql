-- DropForeignKey
ALTER TABLE "OrderWorkflowStepDisplay" DROP CONSTRAINT "OrderWorkflowStepDisplay_stepId_fkey";

-- AddForeignKey
ALTER TABLE "OrderWorkflowStepDisplay" ADD CONSTRAINT "OrderWorkflowStepDisplay_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "OrderWorkflowStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;
