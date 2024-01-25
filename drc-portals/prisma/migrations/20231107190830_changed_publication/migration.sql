/*
  Warnings:

  - You are about to drop the column `citation` on the `publications` table. All the data in the column will be lost.
  - Added the required column `authors` to the `publications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `doi` to the `publications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `issue` to the `publications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `journal` to the `publications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `page` to the `publications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pmcid` to the `publications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pmid` to the `publications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `publications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `volume` to the `publications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `publications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "publications" DROP COLUMN "citation",
ADD COLUMN     "authors" TEXT NOT NULL,
ADD COLUMN     "doi" TEXT NOT NULL,
ADD COLUMN     "issue" INTEGER NOT NULL,
ADD COLUMN     "journal" TEXT NOT NULL,
ADD COLUMN     "page" INTEGER NOT NULL,
ADD COLUMN     "pmcid" TEXT NOT NULL,
ADD COLUMN     "pmid" INTEGER NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "volume" INTEGER NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;
