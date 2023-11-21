/*
  Warnings:

  - You are about to drop the column `approved` on the `dcc_assets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "dcc_assets" DROP COLUMN "approved",
ADD COLUMN     "dccapproved" BOOLEAN NOT NULL DEFAULT false;
