-- CreateTable
CREATE TABLE "fair_assessments" (
    "id" TEXT NOT NULL,
    "dcc_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "rubric" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fair_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fair_assessments_link_timestamp_key" ON "fair_assessments"("link", "timestamp");

-- AddForeignKey
ALTER TABLE "fair_assessments" ADD CONSTRAINT "fair_assessments_dcc_id_fkey" FOREIGN KEY ("dcc_id") REFERENCES "dccs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fair_assessments" ADD CONSTRAINT "fair_assessments_link_fkey" FOREIGN KEY ("link") REFERENCES "dcc_assets"("link") ON DELETE CASCADE ON UPDATE CASCADE;
