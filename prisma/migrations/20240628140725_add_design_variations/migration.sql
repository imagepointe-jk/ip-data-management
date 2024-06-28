-- CreateTable
CREATE TABLE "DesignVariation" (
    "id" SERIAL NOT NULL,
    "parentDesignId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL DEFAULT 'none',
    "colorId" INTEGER NOT NULL,

    CONSTRAINT "DesignVariation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DesignVariation" ADD CONSTRAINT "DesignVariation_parentDesignId_fkey" FOREIGN KEY ("parentDesignId") REFERENCES "Design"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignVariation" ADD CONSTRAINT "DesignVariation_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
