-- CreateTable
CREATE TABLE "partnerships" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT,

    CONSTRAINT "partnerships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dcc_partnerships" (
    "partnership_id" TEXT NOT NULL,
    "dcc_id" TEXT NOT NULL,

    CONSTRAINT "dcc_partnerships_pkey" PRIMARY KEY ("partnership_id","dcc_id")
);

-- AddForeignKey
ALTER TABLE "dcc_partnerships" ADD CONSTRAINT "dcc_partnerships_partnership_id_fkey" FOREIGN KEY ("partnership_id") REFERENCES "partnerships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dcc_partnerships" ADD CONSTRAINT "dcc_partnerships_dcc_id_fkey" FOREIGN KEY ("dcc_id") REFERENCES "dccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
