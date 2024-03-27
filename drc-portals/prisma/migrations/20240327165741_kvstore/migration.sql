-- CreateTable
CREATE TABLE "kvstore" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "kvstore_pkey" PRIMARY KEY ("key")
);
