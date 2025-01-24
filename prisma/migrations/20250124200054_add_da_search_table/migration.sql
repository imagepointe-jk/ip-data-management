-- CreateTable
CREATE TABLE "DignityApparelSearchString" (
    "id" SERIAL NOT NULL,
    "search" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DignityApparelSearchString_pkey" PRIMARY KEY ("id")
);
