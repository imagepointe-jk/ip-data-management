-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Design" (
    "id" SERIAL NOT NULL,
    "designNumber" INTEGER NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "date" TIMESTAMP(3) NOT NULL DEFAULT '1970-01-01 00:00:00 +00:00',
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "designTypeId" INTEGER NOT NULL DEFAULT 0,
    "imageId" INTEGER NOT NULL,
    "defaultBackgroundColorId" INTEGER NOT NULL,

    CONSTRAINT "Design_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "DesignType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "designTypeId" INTEGER NOT NULL,

    CONSTRAINT "DesignCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignSubcategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "designCategoryId" INTEGER NOT NULL,

    CONSTRAINT "DesignSubcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignTag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "DesignTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Color" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "hexCode" TEXT NOT NULL,

    CONSTRAINT "Color_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HubSpotSync" (
    "id" SERIAL NOT NULL,
    "startedById" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),
    "progress" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "HubSpotSync_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DesignToDesignSubcategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_DesignToDesignTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DesignType_name_key" ON "DesignType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DesignCategory_name_key" ON "DesignCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DesignTag_name_key" ON "DesignTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Color_name_key" ON "Color"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Color_hexCode_key" ON "Color"("hexCode");

-- CreateIndex
CREATE UNIQUE INDEX "_DesignToDesignSubcategory_AB_unique" ON "_DesignToDesignSubcategory"("A", "B");

-- CreateIndex
CREATE INDEX "_DesignToDesignSubcategory_B_index" ON "_DesignToDesignSubcategory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DesignToDesignTag_AB_unique" ON "_DesignToDesignTag"("A", "B");

-- CreateIndex
CREATE INDEX "_DesignToDesignTag_B_index" ON "_DesignToDesignTag"("B");

-- AddForeignKey
ALTER TABLE "Design" ADD CONSTRAINT "Design_designTypeId_fkey" FOREIGN KEY ("designTypeId") REFERENCES "DesignType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Design" ADD CONSTRAINT "Design_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Design" ADD CONSTRAINT "Design_defaultBackgroundColorId_fkey" FOREIGN KEY ("defaultBackgroundColorId") REFERENCES "Color"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignCategory" ADD CONSTRAINT "DesignCategory_designTypeId_fkey" FOREIGN KEY ("designTypeId") REFERENCES "DesignType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignSubcategory" ADD CONSTRAINT "DesignSubcategory_designCategoryId_fkey" FOREIGN KEY ("designCategoryId") REFERENCES "DesignCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubSpotSync" ADD CONSTRAINT "HubSpotSync_startedById_fkey" FOREIGN KEY ("startedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DesignToDesignSubcategory" ADD CONSTRAINT "_DesignToDesignSubcategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Design"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DesignToDesignSubcategory" ADD CONSTRAINT "_DesignToDesignSubcategory_B_fkey" FOREIGN KEY ("B") REFERENCES "DesignSubcategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DesignToDesignTag" ADD CONSTRAINT "_DesignToDesignTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Design"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DesignToDesignTag" ADD CONSTRAINT "_DesignToDesignTag_B_fkey" FOREIGN KEY ("B") REFERENCES "DesignTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
