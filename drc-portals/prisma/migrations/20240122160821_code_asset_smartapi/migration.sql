-- DropForeignKey
ALTER TABLE "dcc_assets" DROP CONSTRAINT "s3_link";

-- DropForeignKey
ALTER TABLE "dcc_assets" DROP CONSTRAINT "url_link";

-- AlterTable
ALTER TABLE "code_assets" ADD COLUMN     "openAPISpec" BOOLEAN,
ADD COLUMN     "smartAPISpec" BOOLEAN,
ADD COLUMN     "smartAPIURL" TEXT;

-- AddForeignKey
ALTER TABLE "file_assets" ADD CONSTRAINT "file_assets_link_fkey" FOREIGN KEY ("link") REFERENCES "dcc_assets"("link") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_assets" ADD CONSTRAINT "code_assets_link_fkey" FOREIGN KEY ("link") REFERENCES "dcc_assets"("link") ON DELETE RESTRICT ON UPDATE CASCADE;
