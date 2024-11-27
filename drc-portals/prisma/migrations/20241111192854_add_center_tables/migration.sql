-- CreateTable
CREATE TABLE "centers" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "short_label" TEXT,
    "short_description" TEXT,
    "description" TEXT,
    "homepage" TEXT,
    "icon" TEXT,
    "grant_num" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "center_outreach" (
    "outreach_id" TEXT NOT NULL,
    "center_id" TEXT NOT NULL,

    CONSTRAINT "center_outreach_pkey" PRIMARY KEY ("outreach_id")
);

-- AddForeignKey
ALTER TABLE "center_outreach" ADD CONSTRAINT "center_outreach_center_id_fkey" FOREIGN KEY ("center_id") REFERENCES "centers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "center_outreach" ADD CONSTRAINT "center_outreach_outreach_id_fkey" FOREIGN KEY ("outreach_id") REFERENCES "outreach"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
