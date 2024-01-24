/*
  Warnings:

  - The primary key for the `dcc_assets` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `filename` on the `dcc_assets` table. All the data in the column will be lost.
  - You are about to drop the column `filetype` on the `dcc_assets` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[dcc_id,link,lastmodified]` on the table `dcc_assets` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "dcc_assets_dcc_id_filetype_link_lastmodified_key";

-- AlterTable
ALTER TABLE "dcc_assets" DROP CONSTRAINT "dcc_assets_pkey",
DROP COLUMN "filename",
DROP COLUMN "filetype",
ADD CONSTRAINT "dcc_assets_pkey" PRIMARY KEY ("dcc_id", "link", "lastmodified");

-- CreateIndex
CREATE UNIQUE INDEX "dcc_assets_dcc_id_link_lastmodified_key" ON "dcc_assets"("dcc_id", "link", "lastmodified");
