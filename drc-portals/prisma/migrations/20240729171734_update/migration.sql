-- CreateTable
CREATE TABLE "news" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "portal" TEXT NOT NULL,
    "tags" TEXT[],
    "version" TEXT,
    "dcc" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "supp_description" TEXT[],
    "img" TEXT,
    "link" TEXT,
    "prod" BOOLEAN NOT NULL,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);
