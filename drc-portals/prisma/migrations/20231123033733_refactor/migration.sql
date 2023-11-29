/*
  Warnings:

  - You are about to drop the `_XEntityToXLibrary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_XEntityToXSet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `c2m2datapackage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `c2m2file` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `xentity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `xidentity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `xlibrary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `xset` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "NodeType" AS ENUM ('gene', 'gene_set', 'gene_set_library', 'c2m2_file');

-- DropForeignKey
ALTER TABLE "_XEntityToXLibrary" DROP CONSTRAINT "_XEntityToXLibrary_A_fkey";

-- DropForeignKey
ALTER TABLE "_XEntityToXLibrary" DROP CONSTRAINT "_XEntityToXLibrary_B_fkey";

-- DropForeignKey
ALTER TABLE "_XEntityToXSet" DROP CONSTRAINT "_XEntityToXSet_A_fkey";

-- DropForeignKey
ALTER TABLE "_XEntityToXSet" DROP CONSTRAINT "_XEntityToXSet_B_fkey";

-- DropForeignKey
ALTER TABLE "c2m2datapackage" DROP CONSTRAINT "c2m2datapackage_dcc_asset_link_fkey";

-- DropForeignKey
ALTER TABLE "c2m2file" DROP CONSTRAINT "c2m2file_datapackage_id_fkey";

-- DropForeignKey
ALTER TABLE "c2m2file" DROP CONSTRAINT "c2m2file_id_fkey";

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

-- DropTable
DROP TABLE "_XEntityToXLibrary";

-- DropTable
DROP TABLE "_XEntityToXSet";

-- DropTable
DROP TABLE "c2m2datapackage";

-- DropTable
DROP TABLE "c2m2file";

-- DropTable
DROP TABLE "xentity";

-- DropTable
DROP TABLE "xidentity";

-- DropTable
DROP TABLE "xlibrary";

-- DropTable
DROP TABLE "xset";

-- CreateTable
CREATE TABLE "node" (
    "dcc_id" TEXT,
    "id" UUID NOT NULL,
    "type" "NodeType" NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "searchable" tsvector GENERATED ALWAYS AS (to_tsvector('english', label || ' ' || description)) STORED,

    CONSTRAINT "node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gene_node" (
    "id" UUID NOT NULL,
    "entrez" TEXT NOT NULL,
    "ensembl" TEXT NOT NULL,

    CONSTRAINT "gene_node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gene_set_node" (
    "id" UUID NOT NULL,
    "gene_set_library_id" UUID NOT NULL,

    CONSTRAINT "gene_set_node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gene_set_library_node" (
    "id" UUID NOT NULL,
    "dcc_asset_link" TEXT NOT NULL,

    CONSTRAINT "gene_set_library_node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "c2m2_file_node" (
    "id" UUID NOT NULL,
    "c2m2_datapackage_id" UUID NOT NULL,
    "creation_time" TIMESTAMPTZ,
    "persistent_id" TEXT,
    "size_in_bytes" BIGINT,
    "file_format" TEXT,
    "data_type" TEXT,
    "assay_type" TEXT,

    CONSTRAINT "c2m2_file_node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "c2m2_datapackage" (
    "id" UUID NOT NULL,
    "dcc_asset_link" TEXT NOT NULL,

    CONSTRAINT "c2m2_datapackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GeneNodeToGeneSetLibraryNode" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_GeneNodeToGeneSetNode" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE INDEX "node_type_idx" ON "node"("type");

-- CreateIndex
CREATE UNIQUE INDEX "gene_set_library_node_dcc_asset_link_key" ON "gene_set_library_node"("dcc_asset_link");

-- CreateIndex
CREATE UNIQUE INDEX "c2m2_datapackage_dcc_asset_link_key" ON "c2m2_datapackage"("dcc_asset_link");

-- CreateIndex
CREATE UNIQUE INDEX "_GeneNodeToGeneSetLibraryNode_AB_unique" ON "_GeneNodeToGeneSetLibraryNode"("A", "B");

-- CreateIndex
CREATE INDEX "_GeneNodeToGeneSetLibraryNode_B_index" ON "_GeneNodeToGeneSetLibraryNode"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GeneNodeToGeneSetNode_AB_unique" ON "_GeneNodeToGeneSetNode"("A", "B");

-- CreateIndex
CREATE INDEX "_GeneNodeToGeneSetNode_B_index" ON "_GeneNodeToGeneSetNode"("B");

-- AddForeignKey
ALTER TABLE "node" ADD CONSTRAINT "node_dcc_id_fkey" FOREIGN KEY ("dcc_id") REFERENCES "dccs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gene_node" ADD CONSTRAINT "gene_node_id_fkey" FOREIGN KEY ("id") REFERENCES "node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gene_set_node" ADD CONSTRAINT "gene_set_node_id_fkey" FOREIGN KEY ("id") REFERENCES "node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gene_set_node" ADD CONSTRAINT "gene_set_node_gene_set_library_id_fkey" FOREIGN KEY ("gene_set_library_id") REFERENCES "gene_set_library_node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gene_set_library_node" ADD CONSTRAINT "gene_set_library_node_id_fkey" FOREIGN KEY ("id") REFERENCES "node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gene_set_library_node" ADD CONSTRAINT "gene_set_library_node_dcc_asset_link_fkey" FOREIGN KEY ("dcc_asset_link") REFERENCES "dcc_assets"("link") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "c2m2_file_node" ADD CONSTRAINT "c2m2_file_node_id_fkey" FOREIGN KEY ("id") REFERENCES "node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "c2m2_file_node" ADD CONSTRAINT "c2m2_file_node_c2m2_datapackage_id_fkey" FOREIGN KEY ("c2m2_datapackage_id") REFERENCES "c2m2_datapackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "c2m2_datapackage" ADD CONSTRAINT "c2m2_datapackage_dcc_asset_link_fkey" FOREIGN KEY ("dcc_asset_link") REFERENCES "dcc_assets"("link") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GeneNodeToGeneSetLibraryNode" ADD CONSTRAINT "_GeneNodeToGeneSetLibraryNode_A_fkey" FOREIGN KEY ("A") REFERENCES "gene_node"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GeneNodeToGeneSetLibraryNode" ADD CONSTRAINT "_GeneNodeToGeneSetLibraryNode_B_fkey" FOREIGN KEY ("B") REFERENCES "gene_set_library_node"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GeneNodeToGeneSetNode" ADD CONSTRAINT "_GeneNodeToGeneSetNode_A_fkey" FOREIGN KEY ("A") REFERENCES "gene_node"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GeneNodeToGeneSetNode" ADD CONSTRAINT "_GeneNodeToGeneSetNode_B_fkey" FOREIGN KEY ("B") REFERENCES "gene_set_node"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add FTS Index
create index "node_description_fts" on "node" using gin (
  to_tsvector('english'::regconfig, "description")
);

-- Add FTS Index
create index "node_searchable_fts" on "node" using gin ("searchable");

-- Add pg_trgm Extension
create extension if not exists pg_trgm;

-- Add trgm ops
create index "node_label_trgm" on "node" using gin ("label" gin_trgm_ops);
