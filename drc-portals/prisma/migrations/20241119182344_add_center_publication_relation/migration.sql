-- CreateTable
CREATE TABLE "center_publications" (
    "publication_id" TEXT NOT NULL,
    "center_id" TEXT NOT NULL,

    CONSTRAINT "center_publications_pkey" PRIMARY KEY ("publication_id")
);

-- AddForeignKey
ALTER TABLE "center_publications" ADD CONSTRAINT "center_publications_center_id_fkey" FOREIGN KEY ("center_id") REFERENCES "centers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "center_publications" ADD CONSTRAINT "center_publications_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "publications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
