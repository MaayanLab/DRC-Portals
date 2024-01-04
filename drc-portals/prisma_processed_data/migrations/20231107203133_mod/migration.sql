/*
  Warnings:

  - The primary key for the `dcc_assets` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dccId` on the `dcc_assets` table. All the data in the column will be lost.
  - The primary key for the `dcc_publications` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dccId` on the `dcc_publications` table. All the data in the column will be lost.
  - You are about to drop the column `publicationId` on the `dcc_publications` table. All the data in the column will be lost.
  - You are about to drop the column `toolId` on the `publications` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[dcc_id,filetype,link,lastmodified]` on the table `dcc_assets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dcc_id` to the `dcc_assets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dcc_id` to the `dcc_publications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publication_id` to the `dcc_publications` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "dcc_assets" DROP CONSTRAINT "dcc_assets_dccId_fkey";

-- DropForeignKey
ALTER TABLE "dcc_publications" DROP CONSTRAINT "dcc_publications_dccId_fkey";

-- DropForeignKey
ALTER TABLE "dcc_publications" DROP CONSTRAINT "dcc_publications_publicationId_fkey";

-- DropForeignKey
ALTER TABLE "publications" DROP CONSTRAINT "publications_toolId_fkey";

-- DropIndex
DROP INDEX "dcc_assets_dccId_filetype_link_lastmodified_key";

-- AlterTable
ALTER TABLE "dcc_assets" DROP CONSTRAINT "dcc_assets_pkey",
DROP COLUMN "dccId",
ADD COLUMN     "dcc_id" TEXT NOT NULL,
ADD CONSTRAINT "dcc_assets_pkey" PRIMARY KEY ("dcc_id", "filetype", "link", "lastmodified");

-- AlterTable
ALTER TABLE "dcc_publications" DROP CONSTRAINT "dcc_publications_pkey",
DROP COLUMN "dccId",
DROP COLUMN "publicationId",
ADD COLUMN     "dcc_id" TEXT NOT NULL,
ADD COLUMN     "publication_id" TEXT NOT NULL,
ADD CONSTRAINT "dcc_publications_pkey" PRIMARY KEY ("publication_id", "dcc_id");

-- AlterTable
ALTER TABLE "publications" DROP COLUMN "toolId",
ADD COLUMN     "tool_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "dcc_assets_dcc_id_filetype_link_lastmodified_key" ON "dcc_assets"("dcc_id", "filetype", "link", "lastmodified");

-- AddForeignKey
ALTER TABLE "publications" ADD CONSTRAINT "publications_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dcc_publications" ADD CONSTRAINT "dcc_publications_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "publications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dcc_publications" ADD CONSTRAINT "dcc_publications_dcc_id_fkey" FOREIGN KEY ("dcc_id") REFERENCES "dccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dcc_assets" ADD CONSTRAINT "dcc_assets_dcc_id_fkey" FOREIGN KEY ("dcc_id") REFERENCES "dccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
