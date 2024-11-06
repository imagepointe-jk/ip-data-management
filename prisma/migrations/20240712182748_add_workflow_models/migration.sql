-- CreateTable
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderWorkflow" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "OrderWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderWorkflowUser" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "OrderWorkflowUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderWorkflowStep" (
    "id" SERIAL NOT NULL,
    "workflowId" INTEGER NOT NULL,

    CONSTRAINT "OrderWorkflowStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderWorkflowInstance" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "OrderWorkflowInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderWorkflowComment" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "instanceId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "OrderWorkflowComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderWorkflowAccessCode" (
    "userId" INTEGER NOT NULL,
    "instanceId" INTEGER NOT NULL,
    "guid" TEXT NOT NULL,
    "userRole" TEXT NOT NULL,

    CONSTRAINT "OrderWorkflowAccessCode_pkey" PRIMARY KEY ("userId","instanceId")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderWorkflowUser_email_key" ON "OrderWorkflowUser"("email");

-- AddForeignKey
ALTER TABLE "OrderWorkflow" ADD CONSTRAINT "OrderWorkflow_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderWorkflowUser" ADD CONSTRAINT "OrderWorkflowUser_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderWorkflowStep" ADD CONSTRAINT "OrderWorkflowStep_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "OrderWorkflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderWorkflowComment" ADD CONSTRAINT "OrderWorkflowComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "OrderWorkflowUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderWorkflowComment" ADD CONSTRAINT "OrderWorkflowComment_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "OrderWorkflowInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderWorkflowAccessCode" ADD CONSTRAINT "OrderWorkflowAccessCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "OrderWorkflowUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderWorkflowAccessCode" ADD CONSTRAINT "OrderWorkflowAccessCode_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "OrderWorkflowInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
