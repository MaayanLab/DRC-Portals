/*
  Warnings:

  - You are about to drop the column `icon` on the `outreach` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "outreach" DROP COLUMN "icon",
ADD COLUMN     "image" TEXT;
