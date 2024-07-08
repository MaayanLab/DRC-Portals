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

-- compute pagerank for different node types
update "node"
set "pagerank" = (
  select count(*)
  from "kg_assertion"
  where "kg_assertion"."source_id" = "node"."id"
  or  "kg_assertion"."target_id" = "node"."id"
) + (
  select count(*)
  from "_GeneEntityToGeneSetNode"
  where "_GeneEntityToGeneSetNode"."A" = "node"."id"
)
where "type" = 'entity';

update "node"
set "pagerank" = (
  select count(*)
  from "gene_set_node"
  where "gene_set_library_id" = "node"."id"
)
where "type" = 'gene_set_library';

update "node"
set "pagerank" = (
  select count(*)
  from "_GeneEntityToGeneSetNode"
  where "_GeneEntityToGeneSetNode"."B" = "node"."id"
)
where "type" = 'gene_set';

update "node"
set "pagerank" = 0
where "type" = 'c2m2_file';

update "node"
set "pagerank" = (
  select count(*)
  from "kg_assertion"
  where "kg_assertion"."relation_id" = "node"."id"
)
where "type" = 'kg_relation';

update "node"
set "pagerank" = 1
where "type" = 'dcc_asset';

-- CreateIndex
CREATE INDEX "entity_node_type_idx" ON "entity_node"("type");

-- CreateIndex
CREATE INDEX "node_entity_type_idx" ON "node"("entity_type");

-- CreateIndex
CREATE INDEX "node_dcc_idx" ON "node"("dcc_id");

-- CreateIndex
CREATE INDEX "node_pagerank" ON "node"("pagerank" DESC);
