/*
  Warnings:

  - You are about to drop the column `etag` on the `dcc_assets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "dcc_assets" DROP COLUMN "etag",
ADD COLUMN     "shaChecksum" TEXT;
