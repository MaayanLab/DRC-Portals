/*
  Warnings:

  - You are about to drop the `DCC` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DCCPublication` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DccAsset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Publication` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tool` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DCCPublication" DROP CONSTRAINT "DCCPublication_dccId_fkey";

-- DropForeignKey
ALTER TABLE "DCCPublication" DROP CONSTRAINT "DCCPublication_publicationId_fkey";

-- DropForeignKey
ALTER TABLE "DccAsset" DROP CONSTRAINT "DccAsset_dccId_fkey";

-- DropForeignKey
ALTER TABLE "Publication" DROP CONSTRAINT "Publication_toolId_fkey";

-- DropTable
DROP TABLE "DCC";

-- DropTable
DROP TABLE "DCCPublication";

-- DropTable
DROP TABLE "DccAsset";

-- DropTable
DROP TABLE "Publication";

-- DropTable
DROP TABLE "Tool";

-- CreateTable
CREATE TABLE "dccs" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "homepage" TEXT NOT NULL,
    "icon" TEXT,
    "annotation" JSONB,

    CONSTRAINT "dccs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publications" (
    "id" TEXT NOT NULL,
    "citation" TEXT NOT NULL,
    "toolId" TEXT,

    CONSTRAINT "publications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dcc_publications" (
    "publicationId" TEXT NOT NULL,
    "dccId" TEXT NOT NULL,

    CONSTRAINT "dcc_publications_pkey" PRIMARY KEY ("publicationId","dccId")
);

-- CreateTable
CREATE TABLE "tools" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "tools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dcc_assets" (
    "dccId" TEXT NOT NULL,
    "filetype" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "size" INTEGER,
    "lastmodified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "current" BOOLEAN NOT NULL DEFAULT true,
    "creator" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "annotation" JSONB,

    CONSTRAINT "dcc_assets_pkey" PRIMARY KEY ("dccId","filetype","link","lastmodified")
);

-- CreateIndex
CREATE UNIQUE INDEX "dcc_assets_dccId_filetype_link_lastmodified_key" ON "dcc_assets"("dccId", "filetype", "link", "lastmodified");

-- AddForeignKey
ALTER TABLE "publications" ADD CONSTRAINT "publications_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "tools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dcc_publications" ADD CONSTRAINT "dcc_publications_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "publications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dcc_publications" ADD CONSTRAINT "dcc_publications_dccId_fkey" FOREIGN KEY ("dccId") REFERENCES "dccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dcc_assets" ADD CONSTRAINT "dcc_assets_dccId_fkey" FOREIGN KEY ("dccId") REFERENCES "dccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
