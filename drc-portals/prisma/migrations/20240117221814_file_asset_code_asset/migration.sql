/*
  Warnings:

  - You are about to drop the column `annotation` on the `dcc_assets` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `dcc_assets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "dcc_assets" DROP COLUMN "annotation",
DROP COLUMN "size";

-- CreateTable
CREATE TABLE "file_assets" (
    "filetype" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "size" BIGINT,
    "sha256checksum" TEXT,

    CONSTRAINT "file_assets_pkey" PRIMARY KEY ("filetype","link")
);

-- CreateTable
CREATE TABLE "code_assets" (
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "code_assets_pkey" PRIMARY KEY ("type","link")
);

-- CreateIndex
CREATE UNIQUE INDEX "file_assets_link_key" ON "file_assets"("link");

-- CreateIndex
CREATE UNIQUE INDEX "file_assets_filetype_link_key" ON "file_assets"("filetype", "link");

-- CreateIndex
CREATE UNIQUE INDEX "code_assets_link_key" ON "code_assets"("link");

-- CreateIndex
CREATE UNIQUE INDEX "code_assets_type_link_key" ON "code_assets"("type", "link");

-- AddForeignKey
ALTER TABLE "dcc_assets" ADD CONSTRAINT "s3_link" FOREIGN KEY ("link") REFERENCES "file_assets"("link") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dcc_assets" ADD CONSTRAINT "url_link" FOREIGN KEY ("link") REFERENCES "code_assets"("link") ON DELETE RESTRICT ON UPDATE CASCADE;
