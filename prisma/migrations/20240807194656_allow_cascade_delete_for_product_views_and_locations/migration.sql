-- DropForeignKey
ALTER TABLE "CustomProductDecorationLocation" DROP CONSTRAINT "CustomProductDecorationLocation_parentViewId_fkey";

-- DropForeignKey
ALTER TABLE "CustomProductView" DROP CONSTRAINT "CustomProductView_parentVariationId_fkey";

-- AddForeignKey
ALTER TABLE "CustomProductView" ADD CONSTRAINT "CustomProductView_parentVariationId_fkey" FOREIGN KEY ("parentVariationId") REFERENCES "CustomProductSettingsVariation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomProductDecorationLocation" ADD CONSTRAINT "CustomProductDecorationLocation_parentViewId_fkey" FOREIGN KEY ("parentViewId") REFERENCES "CustomProductView"("id") ON DELETE CASCADE ON UPDATE CASCADE;
