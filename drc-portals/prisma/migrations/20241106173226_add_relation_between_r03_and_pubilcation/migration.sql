-- CreateTable
CREATE TABLE "r03_publications" (
    "publication_id" TEXT NOT NULL,
    "r03_id" TEXT NOT NULL,

    CONSTRAINT "r03_publications_pkey" PRIMARY KEY ("publication_id","r03_id")
);

-- AddForeignKey
ALTER TABLE "r03_publications" ADD CONSTRAINT "r03_publications_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "publications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "r03_publications" ADD CONSTRAINT "r03_publications_r03_id_fkey" FOREIGN KEY ("r03_id") REFERENCES "r03"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
