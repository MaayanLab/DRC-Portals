-- AlterTable
ALTER TABLE "dcc_assets" ALTER COLUMN "creator" DROP NOT NULL;

-- Fixup
update "dcc_assets" set "creator" = null where "creator" = 'DCC';

-- AddForeignKey
ALTER TABLE "dcc_assets" ADD CONSTRAINT "dcc_assets_creator_fkey" FOREIGN KEY ("creator") REFERENCES "User"("email") ON DELETE SET NULL ON UPDATE CASCADE;
