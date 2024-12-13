-- CreateTable
CREATE TABLE "r03" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rfa" TEXT,
    "end_date" TIMESTAMP(3),
    "grant_num" TEXT,
    "website" TEXT,
    "video" TEXT,

    CONSTRAINT "r03_pkey" PRIMARY KEY ("id")
);
