/*
  Warnings:

  - A unique constraint covering the columns `[link]` on the table `dcc_assets` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "xidentity" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "searchable" TEXT NOT NULL,
    "entity_id" TEXT,
    "set_id" TEXT,
    "dataset_id" TEXT,

    CONSTRAINT "xidentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xentity" (
    "id" TEXT NOT NULL,

    CONSTRAINT "xentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xset" (
    "id" TEXT NOT NULL,
    "dataset_id" TEXT NOT NULL,

    CONSTRAINT "xset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xdataset" (
    "id" TEXT NOT NULL,
    "dcc_asset_link" TEXT NOT NULL,
    "termType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,

    CONSTRAINT "xdataset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_XEntityToXSet" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_XDatasetToXEntity" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "xidentity_entity_id_key" ON "xidentity"("entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "xidentity_set_id_key" ON "xidentity"("set_id");

-- CreateIndex
CREATE UNIQUE INDEX "xidentity_dataset_id_key" ON "xidentity"("dataset_id");

-- CreateIndex
CREATE UNIQUE INDEX "_XEntityToXSet_AB_unique" ON "_XEntityToXSet"("A", "B");

-- CreateIndex
CREATE INDEX "_XEntityToXSet_B_index" ON "_XEntityToXSet"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_XDatasetToXEntity_AB_unique" ON "_XDatasetToXEntity"("A", "B");

-- CreateIndex
CREATE INDEX "_XDatasetToXEntity_B_index" ON "_XDatasetToXEntity"("B");

-- CreateIndex
CREATE UNIQUE INDEX "dcc_assets_link_key" ON "dcc_assets"("link");

-- CreateIndex
CREATE UNIQUE INDEX "xdataset_dcc_asset_link_key" ON "xdataset"("dcc_asset_link");

-- AddForeignKey
ALTER TABLE "xentity" ADD CONSTRAINT "xentity_id_fkey" FOREIGN KEY ("id") REFERENCES "xidentity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xset" ADD CONSTRAINT "xset_id_fkey" FOREIGN KEY ("id") REFERENCES "xidentity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xset" ADD CONSTRAINT "xset_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "xdataset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xdataset" ADD CONSTRAINT "xdataset_id_fkey" FOREIGN KEY ("id") REFERENCES "xidentity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xdataset" ADD CONSTRAINT "xdataset_dcc_asset_link_fkey" FOREIGN KEY ("dcc_asset_link") REFERENCES "dcc_assets"("link") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_XEntityToXSet" ADD CONSTRAINT "_XEntityToXSet_A_fkey" FOREIGN KEY ("A") REFERENCES "xentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_XEntityToXSet" ADD CONSTRAINT "_XEntityToXSet_B_fkey" FOREIGN KEY ("B") REFERENCES "xset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_XDatasetToXEntity" ADD CONSTRAINT "_XDatasetToXEntity_A_fkey" FOREIGN KEY ("A") REFERENCES "xdataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_XDatasetToXEntity" ADD CONSTRAINT "_XDatasetToXEntity_B_fkey" FOREIGN KEY ("B") REFERENCES "xentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
