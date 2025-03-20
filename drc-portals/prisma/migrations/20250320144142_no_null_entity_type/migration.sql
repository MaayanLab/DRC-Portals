/*
  Warnings:

  - Made the column `entity_type` on table `node` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
UPDATE "node" SET "entity_type" = '' WHERE "entity_type" IS NULL;
ALTER TABLE "node" ALTER COLUMN "entity_type" SET NOT NULL,
ALTER COLUMN "entity_type" SET DEFAULT '';
