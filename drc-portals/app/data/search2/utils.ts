import { db } from '@/lib/kysely'
import { CompiledQuery, Selectable, sql } from 'kysely'
import { DB } from 'kysely-codegen'

/**
 * estimate how many rows a statement will return
 */
async function count_estimate(q: CompiledQuery) {
  const { rows } = await sql<{ Plan: { 'Plan Rows': number } }[]>`EXPLAIN (FORMAT JSON) ${q}`.execute(db)
  return rows[0][0]['Plan']['Plan Rows']
}

/**
 * unordered fts search for entities
 */
function search_entity_unordered(search: string) {
  return db
    .selectFrom('pdp.entity')
    .where(sql`jsonb_to_tsvector('english', attributes, '"all"')`, '@@', sql`websearch_to_tsquery('english', ${search})`)
}

/**
 * estimate how many results the fts search yields
 */
async function search_entity_count_estimate(search: string) {
  return await count_estimate(search_entity_unordered(search).compile())
}

/**
 * When the fts index does not sufficiently reduce the results, we should use the order by index and filter by fts
 */
function search_entity_v1(search: string) {
  return db
    .selectFrom('pdp.entity')
    .where(sql`jsonb_to_tsvector('english', attributes, '"all"')`, '@@', sql`websearch_to_tsquery('english', ${search})`)
    .orderBy('pagerank desc')
}

/**
 * When the fts index can sufficiently reduce the results, we should use it and order by in memory
 */
function search_entity_v2(search: string) {
  return db
    .with('fts', q => q
      .selectFrom('pdp.entity')
      .selectAll()
      .where(sql`jsonb_to_tsvector('english', attributes, '"all"')`, '@@', sql`websearch_to_tsquery('english', ${search})`)
    )
    .selectFrom('fts')
    .orderBy('pagerank desc')
}

/**
 * choose the search method based on count estimate
 */
export async function search_entity(search: string) {
  if ((await search_entity_count_estimate(search)) < 1000) {
    return search_entity_v2(search)
  } else {
    return search_entity_v1(search)
  }
}

/**
 * fast select distinct predicate where source_id = entity
 */
async function entity_target_predicates(entity: string) {
  return await sql<{ 'predicate': Selectable<DB['pdp.edge']>['predicate'] }>`
    WITH RECURSIVE t AS (
      (SELECT edge.predicate FROM
        pdp.edge
        where edge.source_id = ${entity}
        ORDER BY predicate LIMIT 1)
    UNION ALL
      SELECT (SELECT edge.predicate FROM
              pdp.edge
              where edge.source_id = ${entity}
              and edge.predicate > t.predicate ORDER BY predicate LIMIT 1)
      FROM t
      WHERE t.predicate IS NOT NULL
    )
    SELECT predicate
    FROM t
    WHERE predicate IS NOT NULL
  `.execute(db)
}

/**
 * fast select distinct predicate where target_id = entity
 */
async function entity_source_predicates(entity: string) {
  // like select distinct edge.predicate from 
  return await sql<{ 'predicate': Selectable<DB['pdp.edge']>['predicate'] }>`
    WITH RECURSIVE t AS (
      (SELECT edge.predicate FROM
        pdp.edge
        where edge.target_id = ${entity}
        ORDER BY predicate LIMIT 1)
    UNION ALL
      SELECT (SELECT edge.predicate FROM
              pdp.edge
              where edge.target_id = ${entity}
              and edge.predicate > t.predicate ORDER BY predicate LIMIT 1)
      FROM t
      WHERE t.predicate IS NOT NULL
    )
    SELECT predicate
    FROM t
    WHERE predicate IS NOT NULL
  `.execute(db)
}

function entity_target(entity: string, predicate: string) {
  return db
    .selectFrom('pdp.edge')
    .innerJoin('pdp.entity', j => j.onRef('pdp.edge.target_id', '=', 'pdp.entity.id'))
    .where('pdp.edge.predicate', '=', predicate)
    .where('pdp.edge.source_id', '=', entity)
}

function entity_source(entity: string, predicate: string) {
  return db
    .selectFrom('pdp.edge')
    .innerJoin('pdp.entity', j => j.onRef('pdp.edge.source_id', '=', 'pdp.entity.id'))
    .where('pdp.edge.predicate', '=', predicate)
    .where('pdp.edge.target_id', '=', entity)
}
