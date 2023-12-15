/*
  Warnings:

  - A unique constraint covering the columns `[c2m2file_id]` on the table `xidentity` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "xentity" DROP CONSTRAINT "xentity_id_fkey";

-- DropForeignKey
ALTER TABLE "xlibrary" DROP CONSTRAINT "xlibrary_dcc_asset_link_fkey";

-- DropForeignKey
ALTER TABLE "xlibrary" DROP CONSTRAINT "xlibrary_id_fkey";

-- DropForeignKey
ALTER TABLE "xset" DROP CONSTRAINT "xset_id_fkey";

-- DropForeignKey
ALTER TABLE "xset" DROP CONSTRAINT "xset_library_id_fkey";

-- AlterTable
ALTER TABLE "xidentity" ADD COLUMN     "c2m2file_id" UUID;

-- CreateTable
CREATE TABLE "c2m2datapackage" (
    "id" UUID NOT NULL,
    "dcc_asset_link" TEXT NOT NULL,

    CONSTRAINT "c2m2datapackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "c2m2file" (
    "id" UUID NOT NULL,
    "creation_time" TIMESTAMPTZ,
    "persistent_id" TEXT,
    "size_in_bytes" BIGINT,
    "file_format" TEXT,
    "data_type" TEXT,
    "assay_type" TEXT,
    "datapackage_id" UUID NOT NULL,

    CONSTRAINT "c2m2file_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "xidentity_c2m2file_id_key" ON "xidentity"("c2m2file_id");

-- AddForeignKey
ALTER TABLE "xentity" ADD CONSTRAINT "xentity_id_fkey" FOREIGN KEY ("id") REFERENCES "xidentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xset" ADD CONSTRAINT "xset_library_id_fkey" FOREIGN KEY ("library_id") REFERENCES "xlibrary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xset" ADD CONSTRAINT "xset_id_fkey" FOREIGN KEY ("id") REFERENCES "xidentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xlibrary" ADD CONSTRAINT "xlibrary_dcc_asset_link_fkey" FOREIGN KEY ("dcc_asset_link") REFERENCES "dcc_assets"("link") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xlibrary" ADD CONSTRAINT "xlibrary_id_fkey" FOREIGN KEY ("id") REFERENCES "xidentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "c2m2datapackage" ADD CONSTRAINT "c2m2datapackage_dcc_asset_link_fkey" FOREIGN KEY ("dcc_asset_link") REFERENCES "dcc_assets"("link") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "c2m2file" ADD CONSTRAINT "c2m2file_datapackage_id_fkey" FOREIGN KEY ("datapackage_id") REFERENCES "c2m2datapackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "c2m2file" ADD CONSTRAINT "c2m2file_id_fkey" FOREIGN KEY ("id") REFERENCES "xidentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
