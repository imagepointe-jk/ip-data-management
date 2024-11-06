-- DropForeignKey
ALTER TABLE "CustomProductSettingsVariation" DROP CONSTRAINT "CustomProductSettingsVariation_parentSettingsId_fkey";

-- AddForeignKey
ALTER TABLE "CustomProductSettingsVariation" ADD CONSTRAINT "CustomProductSettingsVariation_parentSettingsId_fkey" FOREIGN KEY ("parentSettingsId") REFERENCES "CustomProductSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
