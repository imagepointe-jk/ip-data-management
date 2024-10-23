-- CreateTable
CREATE TABLE "ProductSizeOptions" (
    "id" SERIAL NOT NULL,
    "sizeSmall" BOOLEAN NOT NULL DEFAULT false,
    "sizeMedium" BOOLEAN NOT NULL DEFAULT false,
    "sizeLarge" BOOLEAN NOT NULL DEFAULT false,
    "sizeXL" BOOLEAN NOT NULL DEFAULT false,
    "size2XL" BOOLEAN NOT NULL DEFAULT false,
    "size3XL" BOOLEAN NOT NULL DEFAULT false,
    "size4XL" BOOLEAN NOT NULL DEFAULT false,
    "size5XL" BOOLEAN NOT NULL DEFAULT false,
    "size6XL" BOOLEAN NOT NULL DEFAULT false,
    "customProductSettingsVariationId" INTEGER NOT NULL,

    CONSTRAINT "ProductSizeOptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductSizeOptions_customProductSettingsVariationId_key" ON "ProductSizeOptions"("customProductSettingsVariationId");

-- AddForeignKey
ALTER TABLE "ProductSizeOptions" ADD CONSTRAINT "ProductSizeOptions_customProductSettingsVariationId_fkey" FOREIGN KEY ("customProductSettingsVariationId") REFERENCES "CustomProductSettingsVariation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
