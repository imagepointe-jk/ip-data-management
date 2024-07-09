-- CreateTable
CREATE TABLE "_DesignSubcategoryToDesignVariation" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_DesignTagToDesignVariation" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_DesignSubcategoryToDesignVariation_AB_unique" ON "_DesignSubcategoryToDesignVariation"("A", "B");

-- CreateIndex
CREATE INDEX "_DesignSubcategoryToDesignVariation_B_index" ON "_DesignSubcategoryToDesignVariation"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DesignTagToDesignVariation_AB_unique" ON "_DesignTagToDesignVariation"("A", "B");

-- CreateIndex
CREATE INDEX "_DesignTagToDesignVariation_B_index" ON "_DesignTagToDesignVariation"("B");

-- AddForeignKey
ALTER TABLE "_DesignSubcategoryToDesignVariation" ADD CONSTRAINT "_DesignSubcategoryToDesignVariation_A_fkey" FOREIGN KEY ("A") REFERENCES "DesignSubcategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DesignSubcategoryToDesignVariation" ADD CONSTRAINT "_DesignSubcategoryToDesignVariation_B_fkey" FOREIGN KEY ("B") REFERENCES "DesignVariation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DesignTagToDesignVariation" ADD CONSTRAINT "_DesignTagToDesignVariation_A_fkey" FOREIGN KEY ("A") REFERENCES "DesignTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DesignTagToDesignVariation" ADD CONSTRAINT "_DesignTagToDesignVariation_B_fkey" FOREIGN KEY ("B") REFERENCES "DesignVariation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
