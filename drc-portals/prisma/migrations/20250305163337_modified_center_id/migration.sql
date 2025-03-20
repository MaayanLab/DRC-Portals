/*
  Warnings:

  - The primary key for the `center_publications` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "center_publications" DROP CONSTRAINT "center_publications_pkey",
ADD CONSTRAINT "center_publications_pkey" PRIMARY KEY ("publication_id", "center_id");
