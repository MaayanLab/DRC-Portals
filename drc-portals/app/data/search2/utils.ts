import { db } from '@/lib/kysely'
import { Selectable, sql } from 'kysely'
import { DB } from 'kysely-codegen'

/**
 * estimate how many results the fts search yields
 */
async function search_entity_instant_estimate(search: string) {
  const { rows } = await sql<{ 'QUERY PLAN': { Plan: { 'Plan Rows': number } }[] }>`EXPLAIN (FORMAT JSON) select * from pdp.entity where searchable @@ websearch_to_tsquery('english', ${search})`.execute(db)
  return rows[0]['QUERY PLAN'][0]['Plan']['Plan Rows']
}

async function search_entity_quick_estimate(search: string) {
  const { rows: [{count}] } = await sql<{ count: string | number }>`select count(id) from pdp.entity where searchable @@ websearch_to_tsquery('english', ${search}) limit 100`.execute(db)
  return Number(count)
}

/**
 * When the fts index does not sufficiently reduce the results, we should use the order by index and filter by fts
 */
function search_entity_v1(search: string, offset: number, limit: number) {
  return db
    .with('entity', q => q
      .selectFrom('pdp.entity')
      .select(['id', 'type', 'slug', 'attributes'])
      .where('searchable', '@@', sql<string>`websearch_to_tsquery('english', ${search})`)
      .orderBy('pagerank desc')
      .offset(offset)
      .limit(limit)
    )
    .selectFrom('entity')
}

/**
 * When the fts index can sufficiently reduce the results, we should use it and order by in memory
 */
function search_entity_v2(search: string, offset: number, limit: number) {
  return db
    .with('entity_filtered', q => q
      .selectFrom('pdp.entity')
      .selectAll()
      .where('searchable', '@@', sql<string>`websearch_to_tsquery('english', ${search})`)
      .offset(0)
    )
    .with('entity', q => q
      .selectFrom('entity_filtered')
      .select(['id', 'type', 'slug', 'attributes'])
      .orderBy('entity_filtered.pagerank desc')
      .offset(offset)
      .limit(limit)
    )
    .selectFrom('entity')
}

/**
 * choose the search method based on count estimate
 */
export async function search_entity(search: string, offset: number, limit: number) {
  const instantEstimatedCount = await search_entity_instant_estimate(search)
  const quickEstimatedCount = /*(instantEstimatedCount > 1000) ? await search_entity_quick_estimate(search) :*/ null
  if (instantEstimatedCount === 0) {
    return {
      instantEstimatedCount,
      quickEstimatedCount,
      items: []
    }
  } else if (instantEstimatedCount < 1000 || (quickEstimatedCount && quickEstimatedCount < 100)) {
    return {
      instantEstimatedCount,
      quickEstimatedCount,
      items: await search_entity_v2(search, offset, limit)
        .selectAll('entity')
        .leftJoin('pdp.edge as e', j => j.onRef('e.source_id', '=', 'entity.id').on('e.predicate', '=', 'id_namespace'))
        .leftJoin('pdp.entity as target', j => j.onRef('target.id', '=', 'e.target_id'))
        .select(sql`target.attributes->>'name'`.as('id_namespace'))
        .execute(),
    }
  } else {
    return {
      instantEstimatedCount,
      quickEstimatedCount,
      items: await search_entity_v1(search, offset, limit)
        .selectAll('entity')
        .leftJoin('pdp.edge as e', j => j.onRef('e.source_id', '=', 'entity.id').on('e.predicate', '=', 'id_namespace'))
        .leftJoin('pdp.entity as target', j => j.onRef('target.id', '=', 'e.target_id'))
        .select(sql`target.attributes->>'name'`.as('id_namespace'))
        .execute(),
    }
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
