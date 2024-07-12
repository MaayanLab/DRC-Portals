/*
  Warnings:

  - You are about to drop the column `meeting_link` on the `outreach` table. All the data in the column will be lost.
  - You are about to drop the column `recording` on the `outreach` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "outreach" DROP COLUMN "meeting_link",
DROP COLUMN "recording",
ADD COLUMN     "flyer" TEXT;
