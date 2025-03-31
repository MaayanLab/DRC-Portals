/*
  Warnings:

  - A unique constraint covering the columns `[type,entity_type,slug]` on the table `node` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `node` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
set statement_timeout = 0;

ALTER TABLE "node" ADD COLUMN     "slug" TEXT;

UPDATE "node" SET "slug" = "id"::TEXT;

ALTER TABLE "node" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "node_type_entity_type_slug_key" ON "node"("type", "entity_type", "slug");
