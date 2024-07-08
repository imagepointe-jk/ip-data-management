-- CreateTable
CREATE TABLE "CustomGarmentSettings" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "colorId" INTEGER NOT NULL,

    CONSTRAINT "CustomGarmentSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomGarmentSettingsVariation" (
    "id" SERIAL NOT NULL,
    "parentSettingsId" INTEGER NOT NULL,

    CONSTRAINT "CustomGarmentSettingsVariation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomGarmentView" (
    "id" SERIAL NOT NULL,
    "parentVariationId" INTEGER NOT NULL,

    CONSTRAINT "CustomGarmentView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomGarmentDecorationLocation" (
    "id" SERIAL NOT NULL,
    "positionX" DECIMAL(65,30) NOT NULL,
    "positionY" DECIMAL(65,30) NOT NULL,
    "width" DECIMAL(65,30) NOT NULL,
    "height" DECIMAL(65,30) NOT NULL,
    "parentViewId" INTEGER NOT NULL,

    CONSTRAINT "CustomGarmentDecorationLocation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CustomGarmentSettings" ADD CONSTRAINT "CustomGarmentSettings_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomGarmentSettingsVariation" ADD CONSTRAINT "CustomGarmentSettingsVariation_parentSettingsId_fkey" FOREIGN KEY ("parentSettingsId") REFERENCES "CustomGarmentSettings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomGarmentView" ADD CONSTRAINT "CustomGarmentView_parentVariationId_fkey" FOREIGN KEY ("parentVariationId") REFERENCES "CustomGarmentSettingsVariation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomGarmentDecorationLocation" ADD CONSTRAINT "CustomGarmentDecorationLocation_parentViewId_fkey" FOREIGN KEY ("parentViewId") REFERENCES "CustomGarmentView"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
