/*
  Warnings:

  - You are about to drop the column `tag` on the `outreach` table. All the data in the column will be lost.
  - Added the required column `tags` to the `outreach` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "outreach" DROP COLUMN "tag",
ADD COLUMN     "tags" JSONB NOT NULL;
