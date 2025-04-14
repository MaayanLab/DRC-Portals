-- This is a custom migration to migrate existing genes to slugs
update node set slug = (
  select ensembl
  from gene_entity
  where gene_entity.id = node.id
) where node.type = 'entity' and node.entity_type = 'gene';