/*
  Warnings:

  - Added the required column `short_description` to the `outreach` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "dccs" ADD COLUMN     "cfde_parner" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "outreach" ADD COLUMN     "short_description" TEXT NOT NULL,
ALTER COLUMN "date" DROP NOT NULL,
ALTER COLUMN "time" DROP NOT NULL;
