/*
  Warnings:

  - You are about to drop the column `sha256checksum` on the `dcc_assets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "dcc_assets" DROP COLUMN "sha256checksum";
