/*
  Warnings:

  - You are about to drop the column `dcc` on the `news` table. All the data in the column will be lost.
  - Changed the type of `tags` on the `news` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `supp_description` on the `news` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "news" DROP COLUMN "dcc",
DROP COLUMN "tags",
ADD COLUMN     "tags" JSONB NOT NULL,
DROP COLUMN "supp_description",
ADD COLUMN     "supp_description" JSONB NOT NULL;
