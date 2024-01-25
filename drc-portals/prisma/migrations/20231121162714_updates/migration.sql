/*
  Warnings:

  - The primary key for the `xentity` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `xidentity` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dataset_id` on the `xidentity` table. All the data in the column will be lost.
  - The `entity_id` column on the `xidentity` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `set_id` column on the `xidentity` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `xset` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dataset_id` on the `xset` table. All the data in the column will be lost.
  - You are about to drop the `_XDatasetToXEntity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `xdataset` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[library_id]` on the table `xidentity` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `A` on the `_XEntityToXSet` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `B` on the `_XEntityToXSet` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `xentity` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `type` to the `xidentity` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `xidentity` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `library_id` to the `xset` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `xset` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "_XDatasetToXEntity" DROP CONSTRAINT "_XDatasetToXEntity_A_fkey";

-- DropForeignKey
ALTER TABLE "_XDatasetToXEntity" DROP CONSTRAINT "_XDatasetToXEntity_B_fkey";

-- DropForeignKey
ALTER TABLE "_XEntityToXSet" DROP CONSTRAINT "_XEntityToXSet_A_fkey";

-- DropForeignKey
ALTER TABLE "_XEntityToXSet" DROP CONSTRAINT "_XEntityToXSet_B_fkey";

-- DropForeignKey
ALTER TABLE "xdataset" DROP CONSTRAINT "xdataset_dcc_asset_link_fkey";

-- DropForeignKey
ALTER TABLE "xdataset" DROP CONSTRAINT "xdataset_id_fkey";

-- DropForeignKey
ALTER TABLE "xentity" DROP CONSTRAINT "xentity_id_fkey";

-- DropForeignKey
ALTER TABLE "xset" DROP CONSTRAINT "xset_dataset_id_fkey";

-- DropForeignKey
ALTER TABLE "xset" DROP CONSTRAINT "xset_id_fkey";

-- DropIndex
DROP INDEX "xidentity_dataset_id_key";

-- AlterTable
ALTER TABLE "_XEntityToXSet" DROP COLUMN "A",
ADD COLUMN     "A" UUID NOT NULL,
DROP COLUMN "B",
ADD COLUMN     "B" UUID NOT NULL;

-- AlterTable
ALTER TABLE "xentity" DROP CONSTRAINT "xentity_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "xentity_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "xidentity" DROP CONSTRAINT "xidentity_pkey",
DROP COLUMN "dataset_id",
ADD COLUMN     "library_id" UUID,
ADD COLUMN     "type" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "entity_id",
ADD COLUMN     "entity_id" UUID,
DROP COLUMN "set_id",
ADD COLUMN     "set_id" UUID,
ADD CONSTRAINT "xidentity_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "xset" DROP CONSTRAINT "xset_pkey",
DROP COLUMN "dataset_id",
ADD COLUMN     "library_id" UUID NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "xset_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "_XDatasetToXEntity";

-- DropTable
DROP TABLE "xdataset";

-- CreateTable
CREATE TABLE "xlibrary" (
    "id" UUID NOT NULL,
    "dcc_asset_link" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "term_type" TEXT NOT NULL,

    CONSTRAINT "xlibrary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_XEntityToXLibrary" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "xlibrary_dcc_asset_link_key" ON "xlibrary"("dcc_asset_link");

-- CreateIndex
CREATE UNIQUE INDEX "_XEntityToXLibrary_AB_unique" ON "_XEntityToXLibrary"("A", "B");

-- CreateIndex
CREATE INDEX "_XEntityToXLibrary_B_index" ON "_XEntityToXLibrary"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_XEntityToXSet_AB_unique" ON "_XEntityToXSet"("A", "B");

-- CreateIndex
CREATE INDEX "_XEntityToXSet_B_index" ON "_XEntityToXSet"("B");

-- CreateIndex
CREATE UNIQUE INDEX "xidentity_entity_id_key" ON "xidentity"("entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "xidentity_set_id_key" ON "xidentity"("set_id");

-- CreateIndex
CREATE UNIQUE INDEX "xidentity_library_id_key" ON "xidentity"("library_id");

-- CreateIndex
CREATE INDEX "xidentity_type_idx" ON "xidentity"("type");

-- CreateIndex
CREATE INDEX "xidentity_label_idx" ON "xidentity"("label");

-- AddForeignKey
ALTER TABLE "xentity" ADD CONSTRAINT "xentity_id_fkey" FOREIGN KEY ("id") REFERENCES "xidentity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xset" ADD CONSTRAINT "xset_library_id_fkey" FOREIGN KEY ("library_id") REFERENCES "xlibrary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xset" ADD CONSTRAINT "xset_id_fkey" FOREIGN KEY ("id") REFERENCES "xidentity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xlibrary" ADD CONSTRAINT "xlibrary_dcc_asset_link_fkey" FOREIGN KEY ("dcc_asset_link") REFERENCES "dcc_assets"("link") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xlibrary" ADD CONSTRAINT "xlibrary_id_fkey" FOREIGN KEY ("id") REFERENCES "xidentity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_XEntityToXLibrary" ADD CONSTRAINT "_XEntityToXLibrary_A_fkey" FOREIGN KEY ("A") REFERENCES "xentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_XEntityToXLibrary" ADD CONSTRAINT "_XEntityToXLibrary_B_fkey" FOREIGN KEY ("B") REFERENCES "xlibrary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_XEntityToXSet" ADD CONSTRAINT "_XEntityToXSet_A_fkey" FOREIGN KEY ("A") REFERENCES "xentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_XEntityToXSet" ADD CONSTRAINT "_XEntityToXSet_B_fkey" FOREIGN KEY ("B") REFERENCES "xset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
