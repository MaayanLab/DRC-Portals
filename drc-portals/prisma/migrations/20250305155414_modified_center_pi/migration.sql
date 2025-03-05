/*
  Warnings:

  - You are about to drop the column `principal_investigator` on the `centers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "centers" DROP COLUMN "principal_investigator",
ADD COLUMN     "principal_investigators" JSONB;
