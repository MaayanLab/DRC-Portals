/*
  Warnings:

  - You are about to drop the column `shaChecksum` on the `dcc_assets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "dcc_assets" DROP COLUMN "shaChecksum",
ADD COLUMN     "sha256checksum" TEXT;
