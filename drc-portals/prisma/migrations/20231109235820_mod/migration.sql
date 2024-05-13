-- CreateTable
CREATE TABLE "outreach" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "link" TEXT,

    CONSTRAINT "outreach_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dcc_outreach" (
    "outreach_id" TEXT NOT NULL,
    "dcc_id" TEXT NOT NULL,

    CONSTRAINT "dcc_outreach_pkey" PRIMARY KEY ("outreach_id","dcc_id")
);

-- AddForeignKey
ALTER TABLE "dcc_outreach" ADD CONSTRAINT "dcc_outreach_outreach_id_fkey" FOREIGN KEY ("outreach_id") REFERENCES "outreach"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dcc_outreach" ADD CONSTRAINT "dcc_outreach_dcc_id_fkey" FOREIGN KEY ("dcc_id") REFERENCES "dccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
