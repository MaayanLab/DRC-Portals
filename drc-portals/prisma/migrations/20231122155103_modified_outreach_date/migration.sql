/*
  Warnings:

  - You are about to drop the column `end_time` on the `outreach` table. All the data in the column will be lost.
  - You are about to drop the column `start_time` on the `outreach` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "outreach" DROP COLUMN "end_time",
DROP COLUMN "start_time",
ADD COLUMN     "application_end" TIMESTAMP(3),
ADD COLUMN     "application_start" TIMESTAMP(3);
