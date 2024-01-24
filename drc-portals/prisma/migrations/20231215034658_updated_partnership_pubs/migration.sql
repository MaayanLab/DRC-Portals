/*
  Warnings:

  - You are about to drop the column `active` on the `partnerships` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "partnerships" DROP COLUMN "active",
ADD COLUMN     "status" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "partnership_publications" (
    "partnership_id" TEXT NOT NULL,
    "publication_id" TEXT NOT NULL,

    CONSTRAINT "partnership_publications_pkey" PRIMARY KEY ("partnership_id","publication_id")
);

-- AddForeignKey
ALTER TABLE "partnership_publications" ADD CONSTRAINT "partnership_publications_partnership_id_fkey" FOREIGN KEY ("partnership_id") REFERENCES "partnerships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partnership_publications" ADD CONSTRAINT "partnership_publications_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "publications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
