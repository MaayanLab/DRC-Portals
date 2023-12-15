-- AlterEnum
ALTER TYPE "NodeType" ADD VALUE 'dcc_asset';

-- CreateTable
CREATE TABLE "dcc_asset_node" (
    "id" UUID NOT NULL,
    "link" TEXT NOT NULL,

    CONSTRAINT "dcc_asset_node_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dcc_asset_node_link_key" ON "dcc_asset_node"("link");

-- AddForeignKey
ALTER TABLE "dcc_asset_node" ADD CONSTRAINT "dcc_asset_node_id_fkey" FOREIGN KEY ("id") REFERENCES "node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dcc_asset_node" ADD CONSTRAINT "dcc_asset_node_link_fkey" FOREIGN KEY ("link") REFERENCES "dcc_assets"("link") ON DELETE RESTRICT ON UPDATE CASCADE;
