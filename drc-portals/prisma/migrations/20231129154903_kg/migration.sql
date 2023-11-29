/*
  Warnings:

  - The values [gene] on the enum `NodeType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `_GeneNodeToGeneSetLibraryNode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_GeneNodeToGeneSetNode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gene_node` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NodeType_new" AS ENUM ('entity', 'gene_set', 'gene_set_library', 'c2m2_file', 'kg_relation');
ALTER TABLE "node" ALTER COLUMN "type" TYPE "NodeType_new" USING ("type"::text::"NodeType_new");
ALTER TYPE "NodeType" RENAME TO "NodeType_old";
ALTER TYPE "NodeType_new" RENAME TO "NodeType";
DROP TYPE "NodeType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "_GeneNodeToGeneSetLibraryNode" DROP CONSTRAINT "_GeneNodeToGeneSetLibraryNode_A_fkey";

-- DropForeignKey
ALTER TABLE "_GeneNodeToGeneSetLibraryNode" DROP CONSTRAINT "_GeneNodeToGeneSetLibraryNode_B_fkey";

-- DropForeignKey
ALTER TABLE "_GeneNodeToGeneSetNode" DROP CONSTRAINT "_GeneNodeToGeneSetNode_A_fkey";

-- DropForeignKey
ALTER TABLE "_GeneNodeToGeneSetNode" DROP CONSTRAINT "_GeneNodeToGeneSetNode_B_fkey";

-- DropForeignKey
ALTER TABLE "gene_node" DROP CONSTRAINT "gene_node_id_fkey";

-- DropTable
DROP TABLE "_GeneNodeToGeneSetLibraryNode";

-- DropTable
DROP TABLE "_GeneNodeToGeneSetNode";

-- DropTable
DROP TABLE "gene_node";

-- CreateTable
CREATE TABLE "entity_node" (
    "id" UUID NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "entity_node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kg_relation_node" (
    "id" UUID NOT NULL,

    CONSTRAINT "kg_relation_node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kg_assertion" (
    "id" UUID NOT NULL,
    "relation_id" UUID NOT NULL,
    "source_id" UUID NOT NULL,
    "target_id" UUID NOT NULL,
    "dcc_id" TEXT,
    "SAB" TEXT NOT NULL,
    "evidence" JSONB,

    CONSTRAINT "kg_assertion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gene_entity" (
    "id" UUID NOT NULL,
    "entrez" TEXT NOT NULL,
    "ensembl" TEXT NOT NULL,

    CONSTRAINT "gene_entity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GeneEntityToGeneSetLibraryNode" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_GeneEntityToGeneSetNode" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_GeneEntityToGeneSetLibraryNode_AB_unique" ON "_GeneEntityToGeneSetLibraryNode"("A", "B");

-- CreateIndex
CREATE INDEX "_GeneEntityToGeneSetLibraryNode_B_index" ON "_GeneEntityToGeneSetLibraryNode"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GeneEntityToGeneSetNode_AB_unique" ON "_GeneEntityToGeneSetNode"("A", "B");

-- CreateIndex
CREATE INDEX "_GeneEntityToGeneSetNode_B_index" ON "_GeneEntityToGeneSetNode"("B");

-- AddForeignKey
ALTER TABLE "entity_node" ADD CONSTRAINT "entity_node_id_fkey" FOREIGN KEY ("id") REFERENCES "node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kg_relation_node" ADD CONSTRAINT "kg_relation_node_id_fkey" FOREIGN KEY ("id") REFERENCES "node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kg_assertion" ADD CONSTRAINT "kg_assertion_dcc_id_fkey" FOREIGN KEY ("dcc_id") REFERENCES "dccs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kg_assertion" ADD CONSTRAINT "kg_assertion_relation_id_fkey" FOREIGN KEY ("relation_id") REFERENCES "kg_relation_node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kg_assertion" ADD CONSTRAINT "kg_assertion_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "entity_node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kg_assertion" ADD CONSTRAINT "kg_assertion_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "entity_node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gene_entity" ADD CONSTRAINT "gene_entity_id_fkey" FOREIGN KEY ("id") REFERENCES "entity_node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GeneEntityToGeneSetLibraryNode" ADD CONSTRAINT "_GeneEntityToGeneSetLibraryNode_A_fkey" FOREIGN KEY ("A") REFERENCES "gene_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GeneEntityToGeneSetLibraryNode" ADD CONSTRAINT "_GeneEntityToGeneSetLibraryNode_B_fkey" FOREIGN KEY ("B") REFERENCES "gene_set_library_node"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GeneEntityToGeneSetNode" ADD CONSTRAINT "_GeneEntityToGeneSetNode_A_fkey" FOREIGN KEY ("A") REFERENCES "gene_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GeneEntityToGeneSetNode" ADD CONSTRAINT "_GeneEntityToGeneSetNode_B_fkey" FOREIGN KEY ("B") REFERENCES "gene_set_node"("id") ON DELETE CASCADE ON UPDATE CASCADE;
