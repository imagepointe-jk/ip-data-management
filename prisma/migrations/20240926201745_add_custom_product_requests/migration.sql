-- CreateTable
CREATE TABLE "CustomProductRequest" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "local" TEXT,
    "comments" TEXT,
    "cartJson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomProductRequest_pkey" PRIMARY KEY ("id")
);
