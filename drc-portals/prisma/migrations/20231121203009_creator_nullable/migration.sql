-- DropForeignKey
ALTER TABLE "dcc_assets" DROP CONSTRAINT "dcc_assets_creator_fkey";

-- AlterTable
ALTER TABLE "dcc_assets" ALTER COLUMN "creator" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "dcc_assets" ADD CONSTRAINT "dcc_assets_creator_fkey" FOREIGN KEY ("creator") REFERENCES "User"("email") ON DELETE SET NULL ON UPDATE CASCADE;
