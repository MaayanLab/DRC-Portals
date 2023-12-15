/*
  Warnings:

  - You are about to drop the column `date` on the `outreach` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `outreach` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "outreach" DROP COLUMN "date",
DROP COLUMN "time",
ADD COLUMN     "end_date" TIMESTAMP(3),
ADD COLUMN     "end_time" TIMESTAMP(3),
ADD COLUMN     "start_date" TIMESTAMP(3),
ADD COLUMN     "start_time" TIMESTAMP(3);
