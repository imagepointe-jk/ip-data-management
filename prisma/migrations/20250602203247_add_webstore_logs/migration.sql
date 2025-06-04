-- CreateTable
CREATE TABLE "WebstoreLog" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'Info',
    "event" TEXT,
    "webstoreId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebstoreLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WebstoreLog" ADD CONSTRAINT "WebstoreLog_webstoreId_fkey" FOREIGN KEY ("webstoreId") REFERENCES "Webstore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
