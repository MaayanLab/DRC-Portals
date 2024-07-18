-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- AlterTable
ALTER TABLE "node" ADD COLUMN     "entity_type" TEXT,
ADD COLUMN     "pagerank" DOUBLE PRECISION NOT NULL DEFAULT 0;

set statement_timeout = 0;

-- add entity_type to existing tables
update "node"
set "entity_type" = (
  select "entity_node"."type"
  from "entity_node"
  where "entity_node"."id" = "node"."id"
)
where "type" = 'entity';

-- CreateIndex
CREATE INDEX "entity_node_type_idx" ON "entity_node"("type");

-- CreateIndex
CREATE INDEX "node_entity_type_idx" ON "node"("entity_type");

-- CreateIndex
CREATE INDEX "node_dcc_idx" ON "node"("dcc_id");

-- CreateIndex
CREATE INDEX "node_pagerank" ON "node"("pagerank" DESC);
