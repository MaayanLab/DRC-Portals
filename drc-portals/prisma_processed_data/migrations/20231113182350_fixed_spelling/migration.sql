/*
  Warnings:

  - You are about to drop the column `cfde_parner` on the `dccs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "dccs" DROP COLUMN "cfde_parner",
ADD COLUMN     "cfde_partner" BOOLEAN NOT NULL DEFAULT false;
