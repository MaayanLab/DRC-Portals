-- AlterTable
ALTER TABLE "outreach" ADD COLUMN     "carousel" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "usecase" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "short_description" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "inputs" JSONB NOT NULL,
    "outputs" JSONB NOT NULL,
    "sources" JSONB NOT NULL,
    "link" TEXT,
    "image" TEXT,
    "tutorial" TEXT,
    "creator_dcc_id" TEXT,

    CONSTRAINT "usecase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dcc_usecase" (
    "usecase_id" TEXT NOT NULL,
    "dcc_id" TEXT NOT NULL,

    CONSTRAINT "dcc_usecase_pkey" PRIMARY KEY ("usecase_id","dcc_id")
);

-- AddForeignKey
ALTER TABLE "usecase" ADD CONSTRAINT "usecase_creator_dcc_id_fkey" FOREIGN KEY ("creator_dcc_id") REFERENCES "dccs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dcc_usecase" ADD CONSTRAINT "dcc_usecase_usecase_id_fkey" FOREIGN KEY ("usecase_id") REFERENCES "usecase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dcc_usecase" ADD CONSTRAINT "dcc_usecase_dcc_id_fkey" FOREIGN KEY ("dcc_id") REFERENCES "dccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
