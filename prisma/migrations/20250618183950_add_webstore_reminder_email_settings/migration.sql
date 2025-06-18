-- AlterTable
ALTER TABLE "Webstore" ADD COLUMN     "reminderEmailTargets" TEXT,
ADD COLUMN     "sendReminderEmails" BOOLEAN NOT NULL DEFAULT true;
