-- AlterTable
ALTER TABLE "OrderWorkflowStep" ADD COLUMN     "displayId" INTEGER;

-- CreateTable
CREATE TABLE "OrderWorkflowStepDisplay" (
    "id" SERIAL NOT NULL,
    "positionX" INTEGER NOT NULL,
    "positionY" INTEGER NOT NULL,
    "stepId" INTEGER NOT NULL,

    CONSTRAINT "OrderWorkflowStepDisplay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderWorkflowStepDisplay_stepId_key" ON "OrderWorkflowStepDisplay"("stepId");

-- AddForeignKey
ALTER TABLE "OrderWorkflowStepDisplay" ADD CONSTRAINT "OrderWorkflowStepDisplay_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "OrderWorkflowStep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
